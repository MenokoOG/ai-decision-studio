'use client';

import { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Layers3,
  Loader2,
  LogOut,
  Save,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

type AppHeaderProps = {
  initiativeTitle: string | null;
  initiativePhase: string | null;
  readinessPercent: number;
  confidenceScore: number | null;
  snapshotCount: number;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  autosaveStatus: AutosaveStatus;
  lastSavedAt: string | null;
  isCalculating: boolean;
  hasInitiative: boolean;
  onSave: () => void;
  onCalculate: () => void;
  onExportExcel: () => void;
  onExportMarkdown: () => void;
  onToggleInitiativesPanel: () => void;
  onToggleHelp: () => void;
  onExit: () => void;
};

const PHASE_LABELS: Record<string, string> = {
  DISCOVERY: 'Discovery',
  DESIGN: 'Design',
  BUILD: 'Build',
  PILOT: 'Pilot',
  SCALE: 'Scale',
  GOVERNANCE: 'Governance',
};

export function AppHeader({
  initiativeTitle,
  initiativePhase,
  readinessPercent,
  confidenceScore,
  snapshotCount,
  isSaving,
  hasUnsavedChanges,
  autosaveStatus,
  lastSavedAt,
  isCalculating,
  hasInitiative,
  onSave,
  onCalculate,
  onExportExcel,
  onExportMarkdown,
  onToggleInitiativesPanel,
  onToggleHelp,
  onExit,
}: AppHeaderProps) {
  const [exportOpen, setExportOpen] = useState(false);

  const autosaveDot =
    autosaveStatus === 'saving'
      ? 'bg-violet-400 animate-pulse'
      : autosaveStatus === 'error'
        ? 'bg-rose-400'
        : autosaveStatus === 'pending'
          ? 'bg-amber-400'
          : hasUnsavedChanges
            ? 'bg-amber-400'
            : 'bg-emerald-400';

  const autosaveTip =
    autosaveStatus === 'saving'
      ? 'Saving…'
      : autosaveStatus === 'error'
        ? 'Save failed'
        : autosaveStatus === 'pending'
          ? 'Unsaved changes'
          : lastSavedAt
            ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}`
            : 'No draft saved';

  return (
    <header className="sticky top-0 z-50 border-b border-[#3a1a5e]/60 bg-[#0e0814]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Logo + wordmark */}
        <div className="flex min-w-0 shrink-0 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-[0_0_16px_rgba(139,49,255,0.55)]">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="hidden text-sm font-bold tracking-tight text-violet-50 sm:block">
            AI Decision Studio
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-400/60 hidden sm:block">
            by Menoko OG
          </span>
        </div>

        {/* Divider */}
        <div className="hidden h-5 w-px shrink-0 bg-white/10 sm:block" />

        {/* Active initiative */}
        <button
          type="button"
          onClick={onToggleInitiativesPanel}
          className="group flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-left transition hover:border-violet-400/40 hover:bg-violet-500/10"
        >
          <Layers3 className="size-3.5 shrink-0 text-violet-300" />
          <span className="truncate text-xs font-medium text-slate-200">
            {initiativeTitle ?? 'No initiative selected'}
          </span>
          {initiativePhase ? (
            <span className="hidden shrink-0 rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-200 sm:block">
              {PHASE_LABELS[initiativePhase] ?? initiativePhase}
            </span>
          ) : null}
          <ChevronDown className="size-3 shrink-0 text-slate-400 group-hover:text-violet-300" />
        </button>

        {/* KPI pills — hide on small screens */}
        <div className="hidden items-center gap-1.5 xl:flex">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
            Readiness{' '}
            <span className="font-semibold text-slate-100">{readinessPercent.toFixed(0)}%</span>
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
            Confidence{' '}
            <span className="font-semibold text-slate-100">
              {confidenceScore === null ? 'n/a' : `${confidenceScore.toFixed(1)}%`}
            </span>
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
            Snapshots <span className="font-semibold text-slate-100">{snapshotCount}</span>
          </span>
        </div>

        {/* Autosave status dot */}
        <div
          className="group relative hidden cursor-default items-center gap-1.5 lg:flex"
          title={autosaveTip}
        >
          <span className={`size-2 rounded-full ${autosaveDot}`} />
          <span className="text-[10px] text-slate-500">{autosaveTip}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action group */}
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Calculate */}
          <Button
            size="sm"
            className="gap-1.5 bg-violet-600 text-white shadow-[0_0_12px_rgba(139,49,255,0.35)] hover:bg-violet-500"
            onClick={onCalculate}
            disabled={isCalculating}
          >
            {isCalculating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            <span className="hidden sm:block">{isCalculating ? 'Calculating…' : 'Calculate'}</span>
          </Button>

          {/* Save */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-violet-400/30 text-violet-200 hover:bg-violet-500/15 hover:text-violet-100 disabled:opacity-40"
            onClick={onSave}
            disabled={isSaving || !hasInitiative}
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            <span className="hidden sm:block">{isSaving ? 'Saving…' : 'Save'}</span>
          </Button>

          {/* Export dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-violet-400/30 text-violet-200 hover:bg-violet-500/15 hover:text-violet-100 disabled:opacity-40"
              onClick={() => setExportOpen((v) => !v)}
              disabled={!hasInitiative}
              aria-expanded={exportOpen}
            >
              <Download className="size-3.5" />
              <span className="hidden sm:block">Export</span>
              <ChevronDown className="size-3" />
            </Button>
            {exportOpen ? (
              <>
                {/* Overlay to close */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setExportOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-full z-50 mt-1.5 w-52 overflow-hidden rounded-2xl border border-white/15 bg-[#1a0d2e]/95 shadow-xl backdrop-blur-xl">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-violet-500/20"
                    onClick={() => {
                      setExportOpen(false);
                      onExportExcel();
                    }}
                  >
                    <FileSpreadsheet className="size-4 text-emerald-300" />
                    <div>
                      <p className="font-medium">Excel-compatible (.csv)</p>
                      <p className="text-[11px] text-slate-400">Open directly in Excel</p>
                    </div>
                  </button>
                  <div className="mx-4 border-t border-white/10" />
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-violet-500/20"
                    onClick={() => {
                      setExportOpen(false);
                      onExportMarkdown();
                    }}
                  >
                    <FileText className="size-4 text-violet-300" />
                    <div>
                      <p className="font-medium">Markdown (.md)</p>
                      <p className="text-[11px] text-slate-400">Narrative report</p>
                    </div>
                  </button>
                </div>
              </>
            ) : null}
          </div>

          {/* Initiatives panel toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-slate-300 hover:bg-violet-500/15 hover:text-violet-100"
            onClick={onToggleInitiativesPanel}
            title="Initiatives"
          >
            <Layers3 className="size-4" />
            <span className="hidden lg:block">Initiatives</span>
          </Button>

          {/* Help */}
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:bg-violet-500/15 hover:text-violet-100"
            onClick={onToggleHelp}
            title="How to use"
          >
            <BookOpen className="size-4" />
          </Button>

          {/* Exit */}
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:bg-rose-500/15 hover:text-rose-200"
            onClick={onExit}
            title="Exit session"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
