'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HelpModalProps = {
  onClose: () => void;
};

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-violet-400/20 bg-[#120920]/95 shadow-[0_24px_80px_rgba(100,20,180,0.40)] backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 id="help-modal-title" className="text-lg font-semibold text-violet-50">
              How to Use AI Decision Studio
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              A quick-start guide to getting decision-grade outputs.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100"
            aria-label="Close help"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="grid gap-3 p-6 sm:grid-cols-2">
          <article className="rounded-2xl border border-violet-400/15 bg-violet-500/8 p-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-violet-500/25 text-xs font-bold text-violet-200">
                1
              </span>
              <h3 className="text-sm font-semibold text-slate-100">Create an Initiative</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Open the Initiatives panel (top bar) and create a named initiative. This enables
              auto-save and snapshot versioning so your work persists between sessions.
            </p>
          </article>

          <article className="rounded-2xl border border-violet-400/15 bg-violet-500/8 p-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-violet-500/25 text-xs font-bold text-violet-200">
                2
              </span>
              <h3 className="text-sm font-semibold text-slate-100">Start with Quick Estimate</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Run directional numbers and API usage cost estimates before touching worksheet fields.
              This gives you a fast sanity check before investing time in detailed inputs.
            </p>
          </article>

          <article className="rounded-2xl border border-violet-400/15 bg-violet-500/8 p-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-violet-500/25 text-xs font-bold text-violet-200">
                3
              </span>
              <h3 className="text-sm font-semibold text-slate-100">Fill Scope &amp; Worksheet</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Set baseline annual cost and planning horizon in Scope. Then fill Costs, Benefits, and
              Risk Mitigations with one-time and annual values. Each section saves independently.
            </p>
          </article>

          <article className="rounded-2xl border border-violet-400/15 bg-violet-500/8 p-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-violet-500/25 text-xs font-bold text-violet-200">
                4
              </span>
              <h3 className="text-sm font-semibold text-slate-100">Mark Readiness</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              In AI Cost Checklist, mark each dimension (infrastructure, legal, ops, data, etc.) as
              Unknown, Draft, or Ready. This drives the confidence score shown in the header.
            </p>
          </article>

          <article className="rounded-2xl border border-violet-400/15 bg-violet-500/8 p-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-violet-500/25 text-xs font-bold text-violet-200">
                5
              </span>
              <h3 className="text-sm font-semibold text-slate-100">Calculate &amp; Review</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Press Calculate (header or any section footer) at any time. Open Decision Summary to
              view TCO, net value, ROI, and payback. All outputs are deterministic — no AI
              guesswork.
            </p>
          </article>

          <article className="rounded-2xl border border-violet-400/15 bg-violet-500/8 p-4">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-violet-500/25 text-xs font-bold text-violet-200">
                6
              </span>
              <h3 className="text-sm font-semibold text-slate-100">Export &amp; Share</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Use the Export button in the header to download an Excel workbook (all sections and
              totals) or a Markdown narrative report. Both formats are ready for board-level
              sharing.
            </p>
          </article>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-white/10 px-6 py-4">
          <Button size="sm" className="bg-violet-600 hover:bg-violet-500" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
