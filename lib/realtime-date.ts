'use client';

import { useState, useEffect } from 'react';

const HARI_INDONESIA = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN_INDONESIA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const BULAN_SINGKAT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/**
 * Format a Date object to Indonesian full date format:
 * Contoh: "Senin, 16 November 2026"
 */
export function formatIndonesianFullDate(dateInput?: Date | string | number): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return '';
  const hari = HARI_INDONESIA[d.getDay()];
  const tanggal = d.getDate();
  const bulan = BULAN_INDONESIA[d.getMonth()];
  const tahun = d.getFullYear();
  return `${hari}, ${tanggal} ${bulan} ${tahun}`;
}

/**
 * Format a Date object with time in WIB:
 * Contoh: "16 Nov 2026 • 23:25 WIB"
 */
export function formatIndonesianDateTime(
  dateInput?: Date | string | number,
  options?: { withDay?: boolean; withSeconds?: boolean }
): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return '';
  const tanggal = d.getDate();
  const bulan = BULAN_SINGKAT[d.getMonth()];
  const tahun = d.getFullYear();
  const jam = String(d.getHours()).padStart(2, '0');
  const menit = String(d.getMinutes()).padStart(2, '0');
  const detik = String(d.getSeconds()).padStart(2, '0');
  const timeStr = options?.withSeconds ? `${jam}:${menit}:${detik} WIB` : `${jam}:${menit} WIB`;

  if (options?.withDay) {
    const hari = HARI_INDONESIA[d.getDay()];
    return `${hari}, ${tanggal} ${BULAN_INDONESIA[d.getMonth()]} ${tahun} • ${timeStr}`;
  }
  return `${tanggal} ${bulan} ${tahun} • ${timeStr}`;
}

/**
 * Format Indonesian time string:
 * Contoh: "23:25 WIB" or "23:25:44 WIB"
 */
export function formatIndonesianTime(
  dateInput?: Date | string | number,
  withSeconds = false
): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return '';
  const jam = String(d.getHours()).padStart(2, '0');
  const menit = String(d.getMinutes()).padStart(2, '0');
  if (withSeconds) {
    const detik = String(d.getSeconds()).padStart(2, '0');
    return `${jam}:${menit}:${detik} WIB`;
  }
  return `${jam}:${menit} WIB`;
}

/**
 * Generate a real-time timestamp offset relative to now:
 * Contoh: minutesAgo = 15 menghasilkan timestamp 15 menit sebelum sekarang
 */
export function getRelativeTimeAgo(minutesAgo = 0, withDay = false): string {
  const now = new Date();
  const target = new Date(now.getTime() - minutesAgo * 60 * 1000);
  return formatIndonesianDateTime(target, { withDay });
}

/**
 * Generate ISO string with WIB offset (+07:00) or UTC
 */
export function getRealtimeISOString(offsetMinutes = 0): string {
  const d = new Date(Date.now() - offsetMinutes * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const date = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}+07:00`;
}

/**
 * React hook that gives a live ticking real-time clock:
 * Updates every second or minute, hydrated safely on client.
 */
export function useRealtimeClock(withSeconds = false) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, withSeconds ? 1000 : 10000);
    return () => clearInterval(interval);
  }, [withSeconds]);

  const safeDate = now || new Date();
  const formattedFull = formatIndonesianFullDate(safeDate);
  const formattedTime = formatIndonesianTime(safeDate, withSeconds);
  const formattedDateTime = formatIndonesianDateTime(safeDate, { withDay: true, withSeconds });

  return {
    now: safeDate,
    isHydrated: now !== null,
    formattedFull,
    formattedTime,
    formattedDateTime,
  };
}
