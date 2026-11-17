import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateVitalSeverity,
  filterPatientQueue,
  formatDuration,
  getInitials,
  getSingleVitalFlag,
  validateConsultationForm,
  validateOrderForm,
  validateSoapNote,
  VitalSigns,
} from './clinical';
import { INITIAL_PATIENTS } from './seed';

const nominalVitals: VitalSigns = {
  heartRate: 74,
  systolicBp: 118,
  diastolicBp: 76,
  spo2: 98,
  respiratoryRate: 15,
  temperatureC: 36.6,
  updatedAt: '09:00:00',
};

test('evaluateVitalSeverity classifies nominal, warning, and critical thresholds accurately', () => {
  assert.equal(evaluateVitalSeverity(nominalVitals), 'nominal');

  assert.equal(
    evaluateVitalSeverity({ ...nominalVitals, spo2: 93, heartRate: 104 }),
    'warning'
  );

  assert.equal(
    evaluateVitalSeverity({ ...nominalVitals, spo2: 90 }),
    'critical'
  );

  assert.equal(
    evaluateVitalSeverity({ ...nominalVitals, systolicBp: 185, diastolicBp: 105 }),
    'critical'
  );
});

test('getSingleVitalFlag checks individual vital metrics', () => {
  assert.equal(getSingleVitalFlag('heartRate', { ...nominalVitals, heartRate: 125 }), 'critical');
  assert.equal(getSingleVitalFlag('bp', { ...nominalVitals, systolicBp: 145 }), 'warning');
  assert.equal(getSingleVitalFlag('temperatureC', { ...nominalVitals, temperatureC: 39.2 }), 'critical');
  assert.equal(getSingleVitalFlag('spo2', nominalVitals), 'nominal');
});

test('formatDuration formats seconds into MM:SS and HH:MM:SS', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(65), '01:05');
  assert.equal(formatDuration(3661), '01:01:01');
  assert.equal(formatDuration(-10), '00:00');
});

test('filterPatientQueue filters by query and status including critical vitals', () => {
  const all = filterPatientQueue(INITIAL_PATIENTS, '', 'all');
  assert.equal(all.length, INITIAL_PATIENTS.length);

  const byMrn = filterPatientQueue(INITIAL_PATIENTS, '88412', 'all');
  assert.equal(byMrn.length, 1);
  assert.equal(byMrn[0].name, 'Elena Vance');

  const pending = filterPatientQueue(INITIAL_PATIENTS, '', 'pending');
  assert.equal(pending.length, 1);
  assert.equal(pending[0].name, 'Marcus Sterling');

  const critical = filterPatientQueue(INITIAL_PATIENTS, '', 'critical');
  assert.equal(critical.length, 2);
});

test('validateConsultationForm rejects empty or invalid fields and accepts valid data', () => {
  const invalid = validateConsultationForm({
    name: '',
    age: '150',
    sex: 'Female',
    department: '',
    chiefComplaint: 'pain',
    attendingPhysician: '',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.age);
  assert.ok(invalid.errors.department);
  assert.ok(invalid.errors.chiefComplaint);
  assert.ok(invalid.errors.attendingPhysician);

  const valid = validateConsultationForm({
    name: 'Clara Hendriks',
    age: '44',
    sex: 'Female',
    department: 'Cardiology',
    chiefComplaint: 'Follow-up after Holter monitor evaluation',
    attendingPhysician: 'Dr. Aris Thorne, MD',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('validateOrderForm and validateSoapNote enforce required clinical documentation', () => {
  const badOrder = validateOrderForm({
    medication: '',
    dosage: '',
    frequency: 'Once daily',
    route: '',
  });
  assert.equal(badOrder.valid, false);
  assert.ok(badOrder.errors.medication);
  assert.ok(badOrder.errors.dosage);
  assert.ok(badOrder.errors.route);

  const goodOrder = validateOrderForm({
    medication: 'Lisinopril',
    dosage: '10 mg',
    frequency: 'Once daily',
    route: 'Oral (PO)',
  });
  assert.equal(goodOrder.valid, true);

  assert.equal(validateSoapNote({ subjective: ' ', objective: ' ', assessment: '', plan: '' }).valid, false);
  assert.equal(validateSoapNote({ subjective: 'Alert', objective: '', assessment: '', plan: '' }).valid, true);
});

test('getInitials extracts clean two-letter monogram', () => {
  assert.equal(getInitials('Elena Vance'), 'EV');
  assert.equal(getInitials('Dr. Aris Thorne'), 'AT');
  assert.equal(getInitials('Nadia'), 'NA');
});
