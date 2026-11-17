import React from 'react';
import { ConnectionStatus, TriageSeverity } from '@/lib/clinical';

interface ConnectionBadgeProps {
  status: ConnectionStatus;
  liveStream?: boolean;
}

export function ConnectionBadge({ status, liveStream = false }: ConnectionBadgeProps) {
  const styles: Record<
    ConnectionStatus,
    { bg: string; border: string; text: string; dot: string; label: string }
  > = {
    connected: {
      bg: 'bg-[#ECFDF5]',
      border: 'border-[#A7F3D0]',
      text: 'text-[#065F46]',
      dot: 'bg-[#10B981]',
      label: 'Terhubung',
    },
    pending: {
      bg: 'bg-[#FFFBEB]',
      border: 'border-[#FDE68A]',
      text: 'text-[#92400E]',
      dot: 'bg-[#F59E0B]',
      label: 'Menghubungkan',
    },
    disconnected: {
      bg: 'bg-[#FEF2F2]',
      border: 'border-[#FECACA]',
      text: 'text-[#991B1B]',
      dot: 'bg-[#EF4444]',
      label: 'Terputus',
    },
  };

  const cfg = styles[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em] whitespace-nowrap shrink-0 ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${cfg.dot} ${
          liveStream && status === 'pending' ? 'animate-pulse' : ''
        }`}
      />
      <span>{cfg.label}</span>
    </span>
  );
}

interface SeverityTextProps {
  severity: TriageSeverity;
  compact?: boolean;
}

export function SeverityIndicator({ severity, compact = false }: SeverityTextProps) {
  const styles: Record<
    TriageSeverity,
    { text: string; bg: string; border: string; label: string }
  > = {
    nominal: {
      text: 'text-[#065F46]',
      bg: 'bg-[#ECFDF5]',
      border: 'border-[#A7F3D0]',
      label: 'Normal',
    },
    warning: {
      text: 'text-[#92400E]',
      bg: 'bg-[#FFFBEB]',
      border: 'border-[#FDE68A]',
      label: 'Waspada',
    },
    critical: {
      text: 'text-[#991B1B]',
      bg: 'bg-[#FEF2F2]',
      border: 'border-[#FECACA]',
      label: 'Kritis',
    },
  };

  const cfg = styles[severity];

  if (compact) {
    return (
      <span className={`text-xs font-semibold whitespace-nowrap ${cfg.text}`}>
        {cfg.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em] whitespace-nowrap shrink-0 ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}
