'use client';

import type { ReactNode } from 'react';
import { Calculator, Eraser, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

export type SectionStatus = 'unknown' | 'draft' | 'ready';

type SectionFormProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  status?: SectionStatus;
  onSave?: () => void | Promise<void>;
  onCalculate?: () => void | Promise<void>;
  onClear?: () => void;
  onClose: () => void;
  isSaving?: boolean;
  isCalculating?: boolean;
  saveLabel?: string;
  calculateLabel?: string;
  clearLabel?: string;
  clearConfirmMessage?: string;
  children: ReactNode;
};

const STATUS_PILL: Record<SectionStatus, string> = {
  unknown: 'border-slate-300/30 bg-slate-700/20 text-slate-200',
  draft: 'border-amber-300/40 bg-amber-500/10 text-amber-100',
  ready: 'border-emerald-300/40 bg-emerald-500/10 text-emerald-100',
};

const STATUS_LABEL: Record<SectionStatus, string> = {
  unknown: 'Not started',
  draft: 'Draft',
  ready: 'Ready',
};

export function SectionForm({
  title,
  description,
  icon,
  status,
  onSave,
  onCalculate,
  onClear,
  onClose,
  isSaving = false,
  isCalculating = false,
  saveLabel = 'Save',
  calculateLabel = 'Calculate',
  clearLabel = 'Clear',
  clearConfirmMessage = 'Clear this section? This cannot be undone.',
  children,
}: SectionFormProps) {
  const handleClear = () => {
    if (!onClear) return;
    if (typeof window !== 'undefined' && !window.confirm(clearConfirmMessage)) {
      return;
    }
    onClear();
  };

  return (
    <section className="mt-6 rounded-3xl border border-white/15 bg-[#0f1a35]/55 p-5 backdrop-blur-sm sm:p-6">
      <header className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {icon ? (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-cyan-100">
              {icon}
            </div>
          ) : null}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-50 sm:text-xl">{title}</h3>
              {status ? (
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${STATUS_PILL[status]}`}
                >
                  {STATUS_LABEL[status]}
                </span>
              ) : null}
            </div>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm text-slate-300">{description}</p>
            ) : null}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="self-end text-slate-300 hover:text-slate-50"
          aria-label={`Close ${title}`}
        >
          <X className="size-4" />
          Close
        </Button>
      </header>

      <div className="py-5">{children}</div>

      <footer className="sticky bottom-2 z-10 -mx-5 mt-2 rounded-2xl border border-white/10 bg-[#0b1733]/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-5">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {onClear ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="gap-1.5 text-rose-200 hover:text-rose-100"
            >
              <Eraser className="size-4" />
              {clearLabel}
            </Button>
          ) : null}
          {onSave ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void onSave()}
              disabled={isSaving}
              className="gap-1.5"
            >
              <Save className="size-4" />
              {isSaving ? 'Saving...' : saveLabel}
            </Button>
          ) : null}
          {onCalculate ? (
            <Button
              size="sm"
              onClick={() => void onCalculate()}
              disabled={isCalculating}
              className="gap-1.5"
            >
              <Calculator className="size-4" />
              {isCalculating ? 'Calculating...' : calculateLabel}
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-1.5">
            <X className="size-4" />
            Close
          </Button>
        </div>
      </footer>
    </section>
  );
}
