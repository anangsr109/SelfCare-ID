'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Award,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  ExternalLink,
  GraduationCap,
  History,
  LayoutDashboard,
  Menu,
  MessageSquareQuote,
  Monitor,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  Sun,
  User,
  X,
} from 'lucide-react';
import { PatientProfile, TelehealthConfig } from '@/lib/telehealth-api';
import { WorkspaceNavigationTab } from './CareFlowSidebar';
import { useRealtimeClock, formatIndonesianTime } from '@/lib/realtime-date';
import { useTheme, ThemeMode } from '@/lib/theme';

interface CareFlowTopHeaderProps {
  profile: PatientProfile | null;
  config: TelehealthConfig;
  activeTab?: WorkspaceNavigationTab;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileMenu: () => void;
  onOpenClarification?: () => void;
  onOpenSettings?: () => void;
  onNavigateTab?: (tab: WorkspaceNavigationTab) => void;
}

export function CareFlowTopHeader({
  profile,
  config,
  activeTab = 'beranda',
  isSidebarCollapsed = false,
  onToggleSidebar,
  onOpenMobileMenu,
  onOpenClarification,
  onOpenSettings,
  onNavigateTab,
}: CareFlowTopHeaderProps) {
  const clock = useRealtimeClock(true);
  const { theme, setTheme } = useTheme();

  // Dropdown states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Interactive notifications state
  const [notifications, setNotifications] = useState(() => [
    {
      id: 'notif-clr-1',
      title: 'Permintaan Klarifikasi Dokter',
      doctor: 'dr. Tirta Wijaya, Sp.PD',
      desc: 'Memerlukan konfirmasi durasi keluhan nyeri epigastrium dan riwayat alergi obat.',
      time: formatIndonesianTime(new Date(Date.now() - 25 * 60 * 1000)),
      unread: true,
      actionTab: 'klarifikasi' as WorkspaceNavigationTab,
      badgeText: 'Perlu Respon',
    },
    {
      id: 'notif-sch-2',
      title: 'Jadwal Temu Virtual Dikonfirmasi',
      doctor: 'Klinik Telemedis Terpadu',
      desc: 'Sesi telekonsultasi spesialis dijadwalkan bersama dr. Tirta Wijaya, Sp.PD.',
      time: formatIndonesianTime(new Date(Date.now() - 55 * 60 * 1000)),
      unread: true,
      actionTab: 'tindak-lanjut' as WorkspaceNavigationTab,
      badgeText: 'Terjadwal',
    },
    {
      id: 'notif-sys-3',
      title: 'Validasi Sistem Telehealth Selesai',
      doctor: 'Sistem Layanan Mandiri',
      desc: 'Seluruh instrumen spesifikasi layanan telah aktif dan siap digunakan secara penuh.',
      time: formatIndonesianTime(new Date(Date.now() - 3 * 3600 * 1000)),
      unread: false,
      actionTab: 'beranda' as WorkspaceNavigationTab,
      badgeText: 'Sistem',
    },
  ]);

  const patientName = profile?.nama || config.nama || 'Citra Lestari Putri';
  const studentNim = config.nim || 'B2A021045';
  const studentClass = config.kelas || '4A-Informatika Medis';
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for quick search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowSearchModal(false);
        setShowNotifications(false);
        setShowProfileMenu(false);
        setShowThemeMenu(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    );
    setShowNotifications(false);
    if (notif.actionTab === 'klarifikasi') {
      if (onOpenClarification) onOpenClarification();
      else if (onNavigateTab) onNavigateTab('klarifikasi');
    } else if (onNavigateTab) {
      onNavigateTab(notif.actionTab);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return 'CL';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  // Dynamic context information according to activeTab
  const getBreadcrumbInfo = (tab: WorkspaceNavigationTab) => {
    switch (tab) {
      case 'beranda':
        return {
          category: 'Layanan Klinis',
          title: 'Beranda Pasien',
          subtitle: 'Dashboard pemantauan terpadu',
        };
      case 'self-assessment':
        return {
          category: 'Layanan Klinis',
          title: 'Self-Assessment',
          subtitle: 'Triase mandiri & formulir keluhan',
        };
      case 'status-uts':
        return {
          category: 'Evaluasi Akademik',
          title: 'Status Penilaian UTS',
          subtitle: 'Matriks capaian 10/10 fitur & review dosen',
        };
      case 'riwayat':
        return {
          category: 'Rekam Medis',
          title: 'Riwayat & Hasil Laporan',
          subtitle: 'Arsip diagnosis dan status pengiriman',
        };
      case 'klarifikasi':
        return {
          category: 'Komunikasi Medis',
          title: 'Klarifikasi Dokter',
          subtitle: 'Tindak respon pertanyaan peninjauan klinis',
        };
      case 'tindak-lanjut':
        return {
          category: 'Layanan Klinis',
          title: 'Tindak Lanjut & Resep',
          subtitle: 'Resep digital & jadwal konsultasi lanjutan',
        };
      case 'consultation':
        return {
          category: 'Konsol Dokter',
          title: 'Ruang Konsultasi',
          subtitle: 'Sesi video telemedis terintegrasi EHR',
        };
      case 'queue':
        return {
          category: 'Konsol Dokter',
          title: 'Antrean Pasien',
          subtitle: 'Daftar triase klinis pasien',
        };
      case 'pengaturan':
        return {
          category: 'Konfigurasi Sistem',
          title: 'Pengaturan Aplikasi',
          subtitle: 'Identitas mahasiswa & token API',
        };
      default:
        return {
          category: 'Layanan Klinis',
          title: 'SelfCare ID Telehealth',
          subtitle: 'Sistem Self-Assessment Kesehatan Mahasiswa',
        };
    }
  };

  const breadcrumb = getBreadcrumbInfo(activeTab);

  // Search items list
  const searchableTabs: {
    tab: WorkspaceNavigationTab;
    label: string;
    desc: string;
    category: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      tab: 'beranda',
      label: 'Beranda Pasien',
      desc: 'Ringkasan profil, status asesmen, dan statistik klinis',
      category: 'Layanan Pasien',
      icon: LayoutDashboard,
    },
    {
      tab: 'self-assessment',
      label: 'Mulai Self-Assessment',
      desc: 'Pengisian formulir keluhan bercabang & kuesioner GAD-7',
      category: 'Layanan Pasien',
      icon: Stethoscope,
    },
    {
      tab: 'riwayat',
      label: 'Riwayat & Pelacakan Asesmen',
      desc: 'Daftar riwayat draf, asesmen terkirim, dan tracking status peninjauan',
      category: 'Rekam Medis',
      icon: History,
    },
    {
      tab: 'klarifikasi',
      label: 'Klarifikasi Peninjauan Dokter',
      desc: 'Thread interaktif tanya jawab dengan dokter peninjau',
      category: 'Komunikasi Medis',
      icon: MessageSquareQuote,
    },
    {
      tab: 'tindak-lanjut',
      label: 'Tindak Lanjut & Resep Digital',
      desc: 'Rekomendasi tindakan, resep obat klinis, dan rujukan spesialis',
      category: 'Layanan Pasien',
      icon: CheckCircle2,
    },
    {
      tab: 'pengaturan',
      label: 'Pengaturan Akun & Konfigurasi API',
      desc: 'Ubah NIM, Nama Lengkap, Kelas, Tanggal Lahir, dan Token Akses',
      category: 'Konfigurasi',
      icon: SlidersHorizontal,
    },
  ];

  const filteredSearch = searchableTabs.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleHamburgerClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onOpenMobileMenu();
    } else {
      if (onToggleSidebar) onToggleSidebar();
      else onOpenMobileMenu();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 transition-colors shadow-2xs">
        {/* Left Side: Universal Hamburger Toggle & Dynamic Contextual Breadcrumb */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={handleHamburgerClick}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition-all shrink-0 cursor-pointer"
            aria-label={isSidebarCollapsed ? 'Perbesar menu navigasi sidebar' : 'Perkecil menu navigasi sidebar'}
            title={isSidebarCollapsed ? 'Perbesar Navigasi Sidebar (Buka)' : 'Perkecil Navigasi Sidebar (Tutup)'}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Dynamic Breadcrumb & Current View Title */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <span className="hidden sm:inline">SelfCare ID</span>
              <span className="hidden sm:inline text-slate-300">/</span>
              <span className="text-teal-700 font-bold">{breadcrumb.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                {breadcrumb.title}
              </h1>
              <span className="hidden lg:inline-block text-slate-300">·</span>
              <span className="hidden lg:inline-block truncate text-xs font-normal text-slate-500">
                {breadcrumb.subtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Quick Command / Search Bar Trigger (Visible on md+) */}
        <div className="hidden md:flex items-center mx-4 flex-1 max-w-md">
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50/80 px-3.5 py-2 text-xs text-slate-500 transition-all hover:border-teal-300 hover:bg-white hover:text-slate-700 hover:shadow-2xs group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
              <span>Cari fitur, formulir, atau data klinis...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-2xs">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right Side: Real-Time Live Clock, Notifications, Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Real-Time Live Clock Pill */}
          <div className="hidden xl:flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="flex items-center gap-1.5 font-medium text-slate-600">
              <Calendar className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
              <span>{clock.formattedFull}</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-teal-900">
              <Clock className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
              <span>{clock.formattedTime}</span>
              <span className="text-[10px] text-slate-400 font-sans">WIB</span>
            </div>
          </div>

          {/* Quick Search Icon for Small Devices (sm/xs) */}
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            aria-label="Cari fitur"
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Theme Selector Popover (Terang, Gelap, Perangkat) */}
          <div className="relative" ref={themeRef}>
            <button
              type="button"
              onClick={() => {
                setShowThemeMenu((prev) => !prev);
                setShowNotifications(false);
                setShowProfileMenu(false);
              }}
              aria-label="Pilih mode tema tampilan (Terang, Gelap, Perangkat)"
              aria-expanded={showThemeMenu}
              className={`relative flex h-9 items-center gap-1.5 rounded-xl border px-2.5 transition-all shadow-2xs ${
                showThemeMenu
                  ? 'border-teal-500 bg-teal-50 text-teal-800'
                  : 'border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {theme === 'light' && <Sun className="h-4 w-4 text-amber-500" />}
              {theme === 'dark' && <Moon className="h-4 w-4 text-indigo-500" />}
              {theme === 'system' && <Monitor className="h-4 w-4 text-teal-600" />}
              <span className="hidden sm:inline text-xs font-semibold">
                {theme === 'light' ? 'Terang' : theme === 'dark' ? 'Gelap' : 'Perangkat'}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400 opacity-70" />
            </button>

            {/* Theme Dropdown Menu */}
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Mode Tema Tampilan
                  </span>
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTheme('light');
                      setShowThemeMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors ${
                      theme === 'light'
                        ? 'bg-amber-50 text-amber-900'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span>Mode Terang</span>
                    </div>
                    {theme === 'light' && <Check className="h-3.5 w-3.5 text-amber-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTheme('dark');
                      setShowThemeMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors ${
                      theme === 'dark'
                        ? 'bg-indigo-50 text-indigo-900'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-indigo-500" />
                      <span>Mode Gelap</span>
                    </div>
                    {theme === 'dark' && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTheme('system');
                      setShowThemeMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors ${
                      theme === 'system'
                        ? 'bg-teal-50 text-teal-900'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-teal-600" />
                      <span>Mode Perangkat</span>
                    </div>
                    {theme === 'system' && <Check className="h-3.5 w-3.5 text-teal-600" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notification Center Popover Trigger */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifications((prev) => !prev);
                setShowProfileMenu(false);
                setShowThemeMenu(false);
              }}
              aria-label="Notifikasi tindakan klinis"
              aria-expanded={showNotifications}
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all shadow-2xs ${
                showNotifications
                  ? 'border-teal-500 bg-teal-50 text-teal-800'
                  : 'border-slate-200/90 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xs font-bold text-slate-900">
                      Pemberitahuan Klinis &amp; Arahan
                    </span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200/60">
                        {unreadCount} Baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 hover:underline"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                </div>

                <div className="mt-3 space-y-2.5 max-h-84 overflow-y-auto pr-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleNotificationClick(notif)}
                      className={`cursor-pointer rounded-xl border p-3 text-xs transition-all ${
                        notif.unread
                          ? 'border-amber-200/90 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-300'
                          : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-100/70 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          {notif.unread ? (
                            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-slate-300 shrink-0" />
                          )}
                          <span className="truncate">{notif.title}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">
                          {notif.time}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] font-medium text-teal-900">
                        {notif.doctor}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        {notif.desc}
                      </p>
                      <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-[10px]">
                        <span className="font-bold text-teal-700 group-hover:underline">
                          Tindak lanjuti &rarr;
                        </span>
                        <span className="rounded-md bg-white/80 px-1.5 py-0.5 font-semibold text-slate-500 border border-slate-200/60">
                          {notif.badgeText}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400">
                    Semua instruksi tersinkronisasi dengan server EHR Telehealth
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu((prev) => !prev);
                setShowNotifications(false);
                setShowThemeMenu(false);
              }}
              aria-label="Buka menu profil mahasiswa"
              aria-expanded={showProfileMenu}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white p-1 sm:px-2.5 sm:py-1.5 text-xs transition-all hover:border-teal-300 hover:bg-slate-50 shadow-2xs group"
            >
              {/* Avatar Circle with Online Ring */}
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-teal-600 to-emerald-500 font-display text-xs font-bold text-white shadow-2xs">
                {getInitials(patientName)}
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-emerald-500" />
              </div>

              {/* Patient Info text (desktop) */}
              <div className="hidden sm:block text-left min-w-0">
                <span className="block truncate font-bold text-slate-800 text-xs group-hover:text-teal-900">
                  {patientName}
                </span>
                <span className="block truncate text-[10px] text-slate-400 font-medium">
                  NIM: {studentNim}
                </span>
              </div>

              <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
            </button>

            {/* Profile Dropdown Popover */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                {/* Header card */}
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white font-bold font-display text-sm">
                      {getInitials(patientName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-slate-900">
                        {patientName}
                      </span>
                      <p className="truncate text-[11px] text-teal-800 font-medium">
                        NIM: {studentNim}
                      </p>
                      <p className="truncate text-[10px] text-slate-500">
                        {studentClass}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/80 pt-2 text-[10px]">
                    <span className="text-slate-500">Status Token:</span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80">
                      Aktif &amp; Terverifikasi
                    </span>
                  </div>
                </div>

                {/* Menu items */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onOpenSettings) onOpenSettings();
                      else if (onNavigateTab) onNavigateTab('pengaturan');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                    <span>Pengaturan Akun &amp; Token</span>
                  </button>
                </div>

                <div className="mt-2 border-t border-slate-100 pt-2 px-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>SelfCare ID Telehealth</span>
                    <span className="text-emerald-700 font-semibold">● Online</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Quick Search Modal (Cmd+K / Ctrl+K) */}
      {showSearchModal && (
        <div
          role="presentation"
          onClick={() => setShowSearchModal(false)}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/40 backdrop-blur-xs px-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Pencarian cepat fitur"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama fitur, formulir, atau data yang dicari..."
                autoFocus
                className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search Results */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredSearch.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Tidak ditemukan fitur yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
                </div>
              ) : (
                filteredSearch.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => {
                        setShowSearchModal(false);
                        setSearchQuery('');
                        if (onNavigateTab) onNavigateTab(item.tab);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-teal-50/70 hover:text-teal-900 transition-colors group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-800 group-hover:text-teal-950">
                            {item.label}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-semibold text-slate-500">
                            {item.category}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-slate-500 group-hover:text-teal-800">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-400">
              <span>Navigasi cepat SelfCare ID Telehealth</span>
              <span>Tekan <kbd className="font-mono font-bold text-slate-600">Esc</kbd> untuk menutup</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
