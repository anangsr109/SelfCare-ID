'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Single skeleton element with animated shimmer gradient
 */
export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer ${className}`}
      style={style}
    />
  );
}

/**
 * Skeleton for Metric / KPI Summary Cards (Used in Dashboard & Riwayat)
 */
export function SkeletonStatGrid({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 animate-in fade-in duration-200">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-7 w-14 rounded-lg" />
            <Skeleton className="h-2.5 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for Assessment List Items (Used in Riwayat & Dashboard)
 */
export function SkeletonAssessmentList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3.5 animate-in fade-in duration-200" aria-label="Memuat data riwayat">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4"
        >
          {/* Top header row */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-32 rounded-md" />
          </div>

          {/* Body info */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 rounded-md" />
            <Skeleton className="h-3.5 w-full max-w-md rounded-md" />
          </div>

          {/* Bottom actions & metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3 w-36 rounded-md" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24 rounded-xl" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for UTS 10-Feature Checklist Cards
 */
export function SkeletonUtsChecklist({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 animate-in fade-in duration-200">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-4 w-36 rounded-md" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-3/4 rounded-md" />
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Skeleton className="h-3 w-28 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for Form Questions Loading (PengisianFormulir)
 */
export function SkeletonFormQuestions({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-3/4 rounded-md" />
          <div className="pt-2">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
