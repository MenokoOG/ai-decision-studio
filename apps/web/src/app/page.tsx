'use client';

import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createDefaultBusinessCaseInput,
  type BusinessCasePreviewInput,
  type WorksheetSectionId,
} from '@/lib/business-case';

type BusinessCasePreviewResult = {
  horizonYears: number;
  yearLabels: string[];
  sections: Array<{
    id: WorksheetSectionId;
    label: string;
    total: number;
  }>;
  totalCostOfOwnership: number;
  totalBenefit: number;
  netValue: number;
  netAnnualBenefit: number;
  roiPercent: number | null;
  paybackMonths: number | null;
  netYearTotals: number[];
  runningNetTotals: number[];
};

function asCurrency(value: number | null) {
  if (value === null) {
    return 'n/a';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function asPercent(value: number | null) {
  if (value === null) {
    return 'n/a';
  }

  return `${value.toFixed(1)}%`;
}

function asMonths(value: number | null) {
  if (value === null) {
    return 'n/a';
  }

  return `${value.toFixed(1)} months`;
}

function parseNumeric(value: string) {
  if (value.trim() === '') {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function HomePage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';
  const [input, setInput] = useState<BusinessCasePreviewInput>(createDefaultBusinessCaseInput());
  const [preview, setPreview] = useState<BusinessCasePreviewResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sections = useMemo(
    () => [
      {
        id: 'cost' as const,
        title: 'Costs',
        subtitle: 'One-time and recurring implementation costs.',
        rows: input.worksheet.costRows,
      },
      {
        id: 'benefit' as const,
        title: 'Benefits',
        subtitle: 'Savings and value unlocked by this initiative.',
        rows: input.worksheet.benefitRows,
      },
      {
        id: 'mitigation' as const,
        title: 'Risk Mitigations',
        subtitle: 'Risk-control investments and governance actions.',
        rows: input.worksheet.mitigationRows,
      },
    ],
    [input.worksheet],
  );

  const setMeta = (field: 'baselineAnnualCost' | 'horizonYears', value: string) => {
    const parsed = parseNumeric(value);

    setInput((previous) => ({
      ...previous,
      [field]: field === 'horizonYears' ? Math.max(1, Math.trunc(parsed || 1)) : Math.max(0, parsed),
    }));
  };

  const setLine = (section: WorksheetSectionId, index: number, field: 'oneTime' | 'annual', value: string) => {
    const parsed = Math.max(0, parseNumeric(value));

    setInput((previous) => {
      const key = section === 'cost' ? 'costRows' : section === 'benefit' ? 'benefitRows' : 'mitigationRows';
      const rows = [...previous.worksheet[key]];

      if (!rows[index]) {
        return previous;
      }

      rows[index] = {
        ...rows[index],
        [field]: parsed,
      };

      return {
        ...previous,
        worksheet: {
          ...previous.worksheet,
          [key]: rows,
        },
      };
    });
  };

  const calculate = async () => {
    setIsCalculating(true);
    setError(null);

    try {
      const endpoint = apiBaseUrl
        ? `${apiBaseUrl}/api/v1/business-case/preview`
        : '/api/business-case/preview';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to calculate.');
      }

      setPreview(data as BusinessCasePreviewResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-brand-100/80">Web Platform Preview</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">AI Decision Studio</h1>
            <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">by Menoko OG</p>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
              Web-first planning platform for AI business cases, decisions, and delivery roadmaps.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-50">
            API-backed deterministic calculations
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button className="gap-2" onClick={calculate} disabled={isCalculating}>
            <Sparkles className="size-4" />
            {isCalculating ? 'Calculating...' : 'Calculate Business Case'}
          </Button>
          <Button variant="outline" onClick={() => setInput(createDefaultBusinessCaseInput())}>
            Reset Template
          </Button>
          <span className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">
            Backend connected
          </span>
        </div>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-semibold">Business Case Meta</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Baseline annual cost
            <input
              className="rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 text-sm"
              inputMode="decimal"
              value={input.baselineAnnualCost}
              onChange={(event) => setMeta('baselineAnnualCost', event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Horizon years
            <input
              className="rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 text-sm"
              inputMode="numeric"
              value={input.horizonYears}
              onChange={(event) => setMeta('horizonYears', event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        {sections.map((section) => (
          <article key={section.id} className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <h3 className="text-base font-semibold">{section.title}</h3>
            <p className="mt-1 text-xs text-slate-400">{section.subtitle}</p>

            <div className="mt-4 space-y-3">
              {section.rows.map((row, index) => (
                <div key={row.key} className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                  <p className="text-sm font-medium text-slate-100">{row.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{row.description}</p>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="text-xs text-slate-400">
                      One-time
                      <input
                        className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/45 px-2 py-1.5 text-sm"
                        inputMode="decimal"
                        value={row.oneTime}
                        onChange={(event) => setLine(section.id, index, 'oneTime', event.target.value)}
                      />
                    </label>
                    <label className="text-xs text-slate-400">
                      Annual (Year 2+)
                      <input
                        className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/45 px-2 py-1.5 text-sm"
                        inputMode="decimal"
                        value={row.annual}
                        onChange={(event) => setLine(section.id, index, 'annual', event.target.value)}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold">Deterministic Output</h2>
          <p className="mt-1 text-sm text-slate-300">Calculated by server API using shared calculators package.</p>

          {preview ? (
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-slate-400">Total cost of ownership</dt>
              <dd className="text-right font-semibold">{asCurrency(preview.totalCostOfOwnership)}</dd>
              <dt className="text-slate-400">Total benefit</dt>
              <dd className="text-right font-semibold">{asCurrency(preview.totalBenefit)}</dd>
              <dt className="text-slate-400">Net value</dt>
              <dd className="text-right font-semibold">{asCurrency(preview.netValue)}</dd>
              <dt className="text-slate-400">Net annual benefit</dt>
              <dd className="text-right font-semibold">{asCurrency(preview.netAnnualBenefit)}</dd>
              <dt className="text-slate-400">ROI</dt>
              <dd className="text-right font-semibold">{asPercent(preview.roiPercent)}</dd>
              <dt className="text-slate-400">Payback</dt>
              <dd className="text-right font-semibold">{asMonths(preview.paybackMonths)}</dd>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-300">Press calculate to view deterministic outputs.</p>
          )}
        </div>

        <Card className="rounded-3xl border-white/10 bg-white/5">
          <CardHeader className="p-5 pb-2">
            <CardTitle>Backend Recommendation</CardTitle>
            <CardDescription className="text-sm leading-6 text-slate-300">
              Use Next.js as the platform plus a backend layer (Route Handlers now, dedicated services later) for pricing intelligence, provider APIs, and long-running analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0 text-sm text-slate-300">
            Start with a modular monolith in Next.js and add worker/services when scraping, external APIs, and optimization jobs scale.
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
