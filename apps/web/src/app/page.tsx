'use client';

import { useMemo, useState } from 'react';
import { Calculator, Compass, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createDefaultBusinessCaseInput,
  type BusinessCasePreviewInput,
  type WorksheetSectionId,
} from '@/lib/business-case';
import { READINESS_ITEMS, createDefaultReadinessState } from '@/lib/readiness';

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

type WorkflowScreen =
  | 'quick-estimate'
  | 'scope'
  | 'costs'
  | 'benefits'
  | 'risks'
  | 'readiness'
  | 'summary';

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

function getSectionTotal(
  preview: BusinessCasePreviewResult | null,
  sectionId: WorksheetSectionId,
) {
  return preview?.sections.find((item) => item.id === sectionId)?.total ?? null;
}

export default function HomePage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';
  const [input, setInput] = useState<BusinessCasePreviewInput>(createDefaultBusinessCaseInput());
  const [preview, setPreview] = useState<BusinessCasePreviewResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<WorkflowScreen>('quick-estimate');
  const [quickBaseline, setQuickBaseline] = useState(220000);
  const [quickReductionPercent, setQuickReductionPercent] = useState(18);
  const [quickOneTime, setQuickOneTime] = useState(120000);
  const [quickAnnualRun, setQuickAnnualRun] = useState(30000);
  const [quickHorizon, setQuickHorizon] = useState(5);
  const [monthlyActiveUsers, setMonthlyActiveUsers] = useState(1000);
  const [requestsPerUserPerMonth, setRequestsPerUserPerMonth] = useState(20);
  const [avgPromptTokens, setAvgPromptTokens] = useState(1200);
  const [avgCompletionTokens, setAvgCompletionTokens] = useState(600);
  const [apiCostPer1kTokens, setApiCostPer1kTokens] = useState(0.01);
  const [readiness, setReadiness] = useState(createDefaultReadinessState());

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

  const quickEstimate = useMemo(() => {
    const annualBenefit = (quickBaseline * quickReductionPercent) / 100;
    const totalBenefit = annualBenefit * quickHorizon;
    const totalCost = quickOneTime + quickAnnualRun * quickHorizon;
    const net = totalBenefit - totalCost;

    return {
      annualBenefit,
      totalBenefit,
      totalCost,
      net,
    };
  }, [quickAnnualRun, quickBaseline, quickHorizon, quickOneTime, quickReductionPercent]);

  const usageScaleEstimate = useMemo(() => {
    const monthlyRequests = monthlyActiveUsers * requestsPerUserPerMonth;
    const tokensPerRequest = avgPromptTokens + avgCompletionTokens;
    const monthlyTokens = monthlyRequests * tokensPerRequest;
    const monthlyTokenBlocks = monthlyTokens / 1000;
    const monthlyApiCost = monthlyTokenBlocks * apiCostPer1kTokens;
    const annualApiCost = monthlyApiCost * 12;

    return {
      monthlyRequests,
      tokensPerRequest,
      monthlyTokens,
      monthlyApiCost,
      annualApiCost,
    };
  }, [
    apiCostPer1kTokens,
    avgCompletionTokens,
    avgPromptTokens,
    monthlyActiveUsers,
    requestsPerUserPerMonth,
  ]);

  const readinessStats = useMemo(() => {
    let readyCount = 0;
    let draftCount = 0;
    let unknownCount = 0;

    for (const item of READINESS_ITEMS) {
      const status = readiness[item.key]?.status ?? 'unknown';
      if (status === 'ready') readyCount += 1;
      else if (status === 'draft') draftCount += 1;
      else unknownCount += 1;
    }

    return {
      readyCount,
      draftCount,
      unknownCount,
      completionPercent: (readyCount / READINESS_ITEMS.length) * 100,
    };
  }, [readiness]);

  const workflowScreens: Array<{ id: WorkflowScreen; label: string; tip: string }> = [
    {
      id: 'quick-estimate',
      label: 'Quick Estimate',
      tip: 'Run fast directional numbers before filling worksheet fields.',
    },
    {
      id: 'scope',
      label: 'Scope & Baseline',
      tip: 'Define your current state and planning horizon first.',
    },
    {
      id: 'costs',
      label: 'Implementation Costs',
      tip: 'Capture one-time and annual costs for the full delivery footprint.',
    },
    {
      id: 'benefits',
      label: 'Business Benefits',
      tip: 'Estimate measurable savings, productivity and differentiation value.',
    },
    {
      id: 'risks',
      label: 'Risk Mitigations',
      tip: 'Budget explicit risk controls before finalizing investment decisions.',
    },
    {
      id: 'readiness',
      label: 'AI Cost Checklist',
      tip: 'Capture full project readiness across cost, ops, legal, and adoption.',
    },
    {
      id: 'summary',
      label: 'Decision Summary',
      tip: 'Review deterministic outcomes and decision guidance.',
    },
  ];

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

  const setReadinessStatus = (itemKey: string, status: 'unknown' | 'draft' | 'ready') => {
    setReadiness((previous) => ({
      ...previous,
      [itemKey]: {
        ...(previous[itemKey] ?? { notes: '' }),
        status,
      },
    }));
  };

  const setReadinessNotes = (itemKey: string, notes: string) => {
    setReadiness((previous) => ({
      ...previous,
      [itemKey]: {
        ...(previous[itemKey] ?? { status: 'unknown' as const }),
        notes,
      },
    }));
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
              Guided AI investment workflow for teams planning from startup through enterprise-scale legacy modernization.
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
        <div className="mt-4 rounded-2xl border border-sky-300/30 bg-sky-500/10 p-4 text-sm text-sky-100">
          <p className="font-semibold">Source of Truth</p>
          <p className="mt-1">
            Fields and assumptions are aligned to your course artifacts in original-worksheets, and the calculator remains deterministic for auditable decision-making.
          </p>
        </div>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-semibold">Guided Workflow</h2>
        <p className="mt-1 text-sm text-slate-300">
          Use the buttons to open one screen at a time. This keeps the UI clean while exposing every field needed for informed decisions.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {workflowScreens.map((screen) => (
            <button
              key={screen.id}
              type="button"
              onClick={() => setActiveScreen(screen.id)}
              className={`rounded-xl border p-3 text-left transition ${
                activeScreen === screen.id
                  ? 'border-brand-400/70 bg-brand-500/15'
                  : 'border-white/10 bg-slate-950/30 hover:border-white/25'
              }`}
            >
              <p className="text-sm font-semibold text-slate-100">{screen.label}</p>
              <p className="mt-1 text-xs text-slate-400">{screen.tip}</p>
            </button>
          ))}
        </div>
      </section>

      {activeScreen === 'quick-estimate' ? (
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2">
            <Calculator className="size-5" />
            <h3 className="text-lg font-semibold">Quick Estimate Calculator</h3>
          </div>
          <p className="mt-1 text-sm text-slate-300">
            Use this for rough what-if analysis before completing worksheet details.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm text-slate-200">
              Current annual spend
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                inputMode="decimal"
                value={quickBaseline}
                onChange={(event) => setQuickBaseline(Math.max(0, parseNumeric(event.target.value)))}
              />
            </label>
            <label className="text-sm text-slate-200">
              Savings target (%)
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                inputMode="decimal"
                value={quickReductionPercent}
                onChange={(event) => setQuickReductionPercent(Math.max(0, parseNumeric(event.target.value)))}
              />
            </label>
            <label className="text-sm text-slate-200">
              One-time investment
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                inputMode="decimal"
                value={quickOneTime}
                onChange={(event) => setQuickOneTime(Math.max(0, parseNumeric(event.target.value)))}
              />
            </label>
            <label className="text-sm text-slate-200">
              Annual run cost
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                inputMode="decimal"
                value={quickAnnualRun}
                onChange={(event) => setQuickAnnualRun(Math.max(0, parseNumeric(event.target.value)))}
              />
            </label>
            <label className="text-sm text-slate-200">
              Planning years
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                inputMode="numeric"
                value={quickHorizon}
                onChange={(event) => setQuickHorizon(Math.max(1, Math.trunc(parseNumeric(event.target.value) || 1)))}
              />
            </label>
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-slate-950/35 p-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Projected annual benefit</dt>
              <dd className="text-lg font-semibold">{asCurrency(quickEstimate.annualBenefit)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Total benefit</dt>
              <dd className="text-lg font-semibold">{asCurrency(quickEstimate.totalBenefit)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Total cost</dt>
              <dd className="text-lg font-semibold">{asCurrency(quickEstimate.totalCost)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Net impact</dt>
              <dd className="text-lg font-semibold">{asCurrency(quickEstimate.net)}</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <h4 className="text-base font-semibold">Usage Scaling Calculator</h4>
            <p className="mt-1 text-sm text-slate-300">
              AI behaves like metered infrastructure. Forecast usage at scale before committing architecture.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm text-slate-200">
                Monthly active users
                <input
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                  inputMode="numeric"
                  value={monthlyActiveUsers}
                  onChange={(event) => setMonthlyActiveUsers(Math.max(0, Math.trunc(parseNumeric(event.target.value))))}
                />
              </label>
              <label className="text-sm text-slate-200">
                Requests per user / month
                <input
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                  inputMode="numeric"
                  value={requestsPerUserPerMonth}
                  onChange={(event) =>
                    setRequestsPerUserPerMonth(Math.max(0, Math.trunc(parseNumeric(event.target.value))))
                  }
                />
              </label>
              <label className="text-sm text-slate-200">
                Avg prompt tokens / request
                <input
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                  inputMode="numeric"
                  value={avgPromptTokens}
                  onChange={(event) => setAvgPromptTokens(Math.max(0, Math.trunc(parseNumeric(event.target.value))))}
                />
              </label>
              <label className="text-sm text-slate-200">
                Avg completion tokens / request
                <input
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                  inputMode="numeric"
                  value={avgCompletionTokens}
                  onChange={(event) => setAvgCompletionTokens(Math.max(0, Math.trunc(parseNumeric(event.target.value))))}
                />
              </label>
              <label className="text-sm text-slate-200">
                API cost per 1K tokens (USD)
                <input
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                  inputMode="decimal"
                  value={apiCostPer1kTokens}
                  onChange={(event) => setApiCostPer1kTokens(Math.max(0, parseNumeric(event.target.value)))}
                />
              </label>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Monthly requests</dt>
                <dd className="text-base font-semibold">{usageScaleEstimate.monthlyRequests.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Tokens per request</dt>
                <dd className="text-base font-semibold">{usageScaleEstimate.tokensPerRequest.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Monthly tokens</dt>
                <dd className="text-base font-semibold">{usageScaleEstimate.monthlyTokens.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Monthly API cost</dt>
                <dd className="text-base font-semibold">{asCurrency(usageScaleEstimate.monthlyApiCost)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">Annual API cost</dt>
                <dd className="text-base font-semibold">{asCurrency(usageScaleEstimate.annualApiCost)}</dd>
              </div>
            </dl>
          </div>
        </section>
      ) : null}

      {activeScreen === 'scope' ? (
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold">Scope & Baseline</h3>
          <p className="mt-1 text-sm text-slate-300">
            Tip: set this first to anchor all downstream cost/benefit assumptions.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              Baseline annual cost
              <input
                className="rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                inputMode="decimal"
                value={input.baselineAnnualCost}
                onChange={(event) => setMeta('baselineAnnualCost', event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              Horizon years
              <input
                className="rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                inputMode="numeric"
                value={input.horizonYears}
                onChange={(event) => setMeta('horizonYears', event.target.value)}
              />
            </label>
          </div>
        </section>
      ) : null}

      {activeScreen === 'costs' || activeScreen === 'benefits' || activeScreen === 'risks' ? (
        <section className="mt-6 grid gap-4 xl:grid-cols-3">
          {sections
            .filter((section) => {
              if (activeScreen === 'costs') return section.id === 'cost';
              if (activeScreen === 'benefits') return section.id === 'benefit';
              return section.id === 'mitigation';
            })
            .map((section) => (
              <article key={section.id} className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 xl:col-span-3">
                <h3 className="text-base font-semibold">{section.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{section.subtitle}</p>
                <div className="mt-2 rounded-xl border border-amber-300/25 bg-amber-500/10 p-3 text-xs text-amber-100">
                  Guide: enter Year-1 setup spend under one-time, then steady-state spend/value under annual.
                </div>

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
      ) : null}

      {activeScreen === 'readiness' ? (
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold">AI Cost Readiness Checklist</h3>
          <p className="mt-1 text-sm text-slate-300">
            Make hidden cost and execution complexity visible early. Mark each item as Unknown, Draft, or Ready.
          </p>

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm">
            <p>Ready: {readinessStats.readyCount}</p>
            <p>Draft: {readinessStats.draftCount}</p>
            <p>Unknown: {readinessStats.unknownCount}</p>
            <p>Completion: {readinessStats.completionPercent.toFixed(0)}%</p>
          </div>

          <div className="mt-4 space-y-3">
            {READINESS_ITEMS.map((item) => {
              const state = readiness[item.key] ?? { status: 'unknown', notes: '' };
              return (
                <article key={item.key} className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                  <p className="text-sm font-semibold text-slate-100">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.description}</p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`rounded-lg border px-2 py-1 text-xs ${
                        state.status === 'unknown' ? 'border-amber-300/60 bg-amber-500/20' : 'border-white/10 bg-slate-900/45'
                      }`}
                      onClick={() => setReadinessStatus(item.key, 'unknown')}
                    >
                      Unknown
                    </button>
                    <button
                      type="button"
                      className={`rounded-lg border px-2 py-1 text-xs ${
                        state.status === 'draft' ? 'border-sky-300/60 bg-sky-500/20' : 'border-white/10 bg-slate-900/45'
                      }`}
                      onClick={() => setReadinessStatus(item.key, 'draft')}
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      className={`rounded-lg border px-2 py-1 text-xs ${
                        state.status === 'ready'
                          ? 'border-emerald-300/60 bg-emerald-500/20'
                          : 'border-white/10 bg-slate-900/45'
                      }`}
                      onClick={() => setReadinessStatus(item.key, 'ready')}
                    >
                      Ready
                    </button>
                  </div>

                  <label className="mt-2 block text-xs text-slate-400">
                    Notes
                    <textarea
                      className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/45 px-2 py-1.5 text-sm"
                      value={state.notes}
                      onChange={(event) => setReadinessNotes(item.key, event.target.value)}
                      rows={2}
                    />
                  </label>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {activeScreen === 'summary' ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Decision Summary</h2>
            <p className="mt-1 text-sm text-slate-300">
              Deterministic outputs from worksheet inputs. No AI guesswork in the numbers.
            </p>

            {preview ? (
              <>
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
                <div className="mt-4 grid gap-2 rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm">
                  <p>Cost section total: {asCurrency(getSectionTotal(preview, 'cost'))}</p>
                  <p>Benefit section total: {asCurrency(getSectionTotal(preview, 'benefit'))}</p>
                  <p>Risk mitigation total: {asCurrency(getSectionTotal(preview, 'mitigation'))}</p>
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm">
                  <p className="font-semibold">Readiness Snapshot</p>
                  <p className="mt-1">Ready items: {readinessStats.readyCount} / {READINESS_ITEMS.length}</p>
                  <p>Open gaps (unknown): {readinessStats.unknownCount}</p>
                  <p>Scale estimate annual API cost: {asCurrency(usageScaleEstimate.annualApiCost)}</p>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-300">Press calculate to view deterministic outputs.</p>
            )}
          </div>

          <Card className="rounded-3xl border-white/10 bg-white/5">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="flex items-center gap-2">
                <Compass className="size-4" />
                Guided Next Step
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-300">
                Future agentic capability will suggest platform options, modern data points, and tradeoffs based on what users enter in each step.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0 text-sm text-slate-300">
              For now, use this deterministic summary to make informed decisions before activating recommendation agents.
            </CardContent>
          </Card>
        </section>
      ) : null}
    </main>
  );
}
