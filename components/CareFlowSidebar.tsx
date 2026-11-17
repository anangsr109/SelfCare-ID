'use client';

import React from 'react';
import {
  Award,
  CalendarCheck2,
  ChevronRight,
  ClipboardCheck,
  Code2,
  ExternalLink,
  GraduationCap,
  HeartPulse,
  History,
  LayoutDashboard,
  MessageSquareQuote,
  Settings,
  SlidersHorizontal,
  Stethoscope,
  Users,
  Video,
  X,
} from 'lucide-react';

export type WorkspaceNavigationTab =
  | 'beranda'
  | 'self-assessment'
  | 'status-uts'
  | 'riwayat'
  | 'klarifikasi'
  | 'tindak-lanjut'
  | 'pengaturan'
  | 'consultation'
  | 'queue';

interface CareFlowSidebarProps {
  activeTab: WorkspaceNavigationTab;
  onSelectTab: (tab: WorkspaceNavigationTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  studentName?: string;
  studentNim?: string;
  studentClass?: string;
}

interface NavMenuItem {
  id: WorkspaceNavigationTab;
  label: string;
  subLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeType?: 'teal' | 'emerald' | 'amber' | 'slate';
}

export function CareFlowSidebar({
  activeTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  studentName = 'Citra Lestari Putri',
  studentNim = 'B2A021045',
  studentClass = '4A-Informatika Medis',
}: CareFlowSidebarProps) {
  // Navigation structure organized by clinical workflow
  const clinicalNavItems: NavMenuItem[] = [
    {
      id: 'beranda',
      label: 'Beranda Pasien',
      subLabel: 'Dashboard kesehatan terpadu',
      icon: LayoutDashboard,
    },
    {
      id: 'self-assessment',
      label: 'Self-Assessment',
      subLabel: 'Triase & formulir keluhan',
      icon: Stethoscope,
      badge: 'Aktif',
      badgeType: 'teal',
    },
    {
      id: 'riwayat',
      label: 'Riwayat & Hasil',
      subLabel: 'Rekam jejak penilaian',
      icon: History,
    },
    {
      id: 'klarifikasi',
      label: 'Klarifikasi Dokter',
      subLabel: 'Tindak jawab pertanyaan tim medis',
      icon: MessageSquareQuote,
      badge: '1 Respon',
      badgeType: 'amber',
    },
    {
      id: 'tindak-lanjut',
      label: 'Tindak Lanjut',
      subLabel: 'Resep digital & jadwal temu',
      icon: CalendarCheck2,
    },
  ];

  const clinicianNavItems: NavMenuItem[] = [
    {
      id: 'consultation',
      label: 'Ruang Konsultasi',
      subLabel: 'Sesi temu video telemedis',
      icon: Video,
    },
    {
      id: 'queue',
      label: 'Antrean Pasien',
      subLabel: 'Daftar triase klinis',
      icon: Users,
    },
  ];

  const systemNavItems: NavMenuItem[] = [
    {
      id: 'pengaturan',
      label: 'Pengaturan Aplikasi',
      subLabel: 'Identitas, kelas & token API',
      icon: SlidersHorizontal,
    },
  ];

  const handleItemClick = (id: WorkspaceNavigationTab) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const renderBadge = (badge?: string, type?: NavMenuItem['badgeType']) => {
    if (!badge) return null;
    let style = 'bg-slate-100 text-slate-600 border-slate-200';
    if (type === 'teal') {
      style = 'bg-teal-50 text-teal-700 border-teal-200/80';
    } else if (type === 'emerald') {
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    } else if (type === 'amber') {
      style = 'bg-amber-50 text-amber-700 border-amber-200/80 animate-pulse';
    }

    return (
      <span
        className={`ml-auto shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${style}`}
      >
        {badge}
      </span>
    );
  };

  const renderNavGroup = (title: string, items: NavMenuItem[]) => (
    <div className="space-y-1">
      {!isCollapsed ? (
        <div className="px-3 pb-1.5 pt-2">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
            {title}
          </span>
        </div>
      ) : (
        <div className="my-2 border-t border-slate-200/60" />
      )}
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id)}
              title={isCollapsed ? `${item.label}${item.subLabel ? ` — ${item.subLabel}` : ''}` : undefined}
              className={`group relative flex w-full items-center ${
                isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2 text-left'
              } rounded-xl transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-teal-50/90 to-emerald-50/50 text-teal-950 font-semibold shadow-2xs ring-1 ring-teal-600/15'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 active:scale-[0.99]'
              }`}
            >
              {/* Left subtle active indicator bar */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-teal-600 shadow-xs"
                />
              )}

              {/* Icon Container with subtle background when active */}
              <div
                className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700'
                }`}
              >
                <Icon className="h-4 w-4 stroke-[1.9]" />
                {isCollapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                )}
              </div>

              {/* Title & Sublabel (expanded only) */}
              {!isCollapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-xs ${
                        isActive ? 'font-bold text-teal-950' : 'font-medium text-slate-700 group-hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.subLabel && (
                      <span className="block truncate text-[10px] text-slate-400 group-hover:text-slate-500">
                        {item.subLabel}
                      </span>
                    )}
                  </div>

                  {/* Badge if present */}
                  {renderBadge(item.badge, item.badgeType)}
                </>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return 'CL';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          role="presentation"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-200 md:hidden"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        aria-label="SelfCare ID Clinical OS Sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200/90 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:w-20 w-72' : 'w-72'
        } ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div
          className={`flex h-18 items-center ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
          } border-b border-slate-200/80 transition-all duration-300`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Custom Healthcare Emblem */}
            <div
              title={isCollapsed ? 'SelfCare ID Telehealth' : undefined}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 text-white shadow-sm shadow-teal-700/25 ring-1 ring-white/20"
            >
              <HeartPulse className="h-5 w-5 stroke-[2.2]" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-base font-extrabold tracking-tight text-slate-900">
                    SelfCare ID
                  </span>
                </div>
                <p className="truncate text-[11px] font-medium text-slate-500">
                  Telehealth Clinical OS
                </p>
              </div>
            )}
          </div>

          {/* Close mobile button */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
              aria-label="Tutup menu navigasi"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Body */}
        <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3.5'} py-4 space-y-4 transition-all duration-300`}>
          {/* Section 1: Layanan Pasien */}
          {renderNavGroup('Layanan Klinis Pasien', clinicalNavItems)}

          {/* Section 2: Konsol Klinis Dokter */}
          {renderNavGroup('Konsol Klinis Dokter', clinicianNavItems)}

          {/* Section 3: Sistem & Konfigurasi */}
          {renderNavGroup('Sistem & Konfigurasi', systemNavItems)}
        </div>

        {/* Sidebar Footer: Authentic Student Identity & EHR Status Card */}
        <div className={`border-t border-slate-200/90 ${isCollapsed ? 'p-2' : 'p-3.5'} bg-slate-50/70 space-y-2.5 transition-all duration-300`}>
          {/* Profile Card Pill */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleItemClick('pengaturan')}
            title={isCollapsed ? `${studentName} (NIM: ${studentNim} · ${studentClass})` : undefined}
            className={`flex items-center ${
              isCollapsed ? 'justify-center p-2' : 'gap-3 p-2.5'
            } rounded-xl border border-slate-200/90 bg-white shadow-2xs hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer group`}
          >
            {/* Avatar Circle with Online Ring */}
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 font-display text-xs font-bold text-white shadow-2xs">
              {getInitials(studentName)}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            {!isCollapsed && (
              <>
                <div className="min-w-0 flex-1 animate-in fade-in duration-200">
                  <span className="block truncate text-xs font-bold text-slate-800 group-hover:text-teal-900">
                    {studentName}
                  </span>
                  <p className="truncate text-[10px] text-slate-500">
                    NIM: {studentNim} · {studentClass}
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
