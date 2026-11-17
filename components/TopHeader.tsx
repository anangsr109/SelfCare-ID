'use client';

import React from 'react';
import { ClinicalWorkspaceView } from '@/lib/clinical';
import { HeartPulse, Plus } from 'lucide-react';

interface TopHeaderProps {
  activeView: ClinicalWorkspaceView;
  onSelectView: (view: ClinicalWorkspaceView) => void;
  onOpenNewConsultation: () => void;
}

const NAV_ITEMS: { id: ClinicalWorkspaceView; label: string; badge?: string }[] = [
  { id: 'assessment', label: 'Self-Assessment (UTS)', badge: '10/10 Fitur' },
  { id: 'consultation', label: 'Ruang Konsultasi' },
  { id: 'queue', label: 'Antrean Pasien' },
];

export function TopHeader({
  activeView,
  onSelectView,
  onOpenNewConsultation,
}: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-2xs">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:gap-8 sm:px-6 lg:px-8">
        {/* Zone 1: Brand wordmark & Healthcare Icon */}
        <button
          type="button"
          onClick={() => onSelectView('assessment')}
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-xs">
            <HeartPulse className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base font-extrabold tracking-tight text-slate-900">SelfCare ID</span>
              <span className="rounded bg-teal-50 px-1 py-0.2 text-[9px] font-bold text-teal-800 border border-teal-200/60">
                Telehealth
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none">
              Sistem Self-Assessment Kesehatan
            </p>
          </div>
        </button>

        {/* Zone 2: Modern pill navigation */}
        <nav
          aria-label="Primary clinical workspace"
          className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-1"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-white text-teal-950 shadow-2xs ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200/60">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenNewConsultation}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:from-teal-700 hover:to-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 stroke-[2.2]" aria-hidden="true" />
            <span>Konsultasi Baru</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation strip */}
      <nav
        aria-label="Mobile clinical workspace"
        className="flex md:hidden items-center gap-1 overflow-x-auto border-t border-slate-200/80 px-4 py-2 bg-slate-50/50"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-teal-50 text-teal-900 ring-1 ring-teal-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
