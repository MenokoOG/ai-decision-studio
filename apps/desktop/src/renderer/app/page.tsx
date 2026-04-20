'use client';

import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useHomeWorkspace } from '../features/home/use-home-workspace';

const cards = [
  ['Initiatives', 'Track AI proposals, owners, status, and assumptions.'],
  ['Business Case', 'Model costs, benefits, risk, and payback.'],
  ['Decisions', 'Compare model and architecture tradeoffs.'],
  ['Roadmap', 'Move from business case to deploy and measure.'],
];

type WorkspaceTab = 'business-case' | 'decision-matrix' | 'roadmap';

const WORKSPACE_TABS: Array<{ id: WorkspaceTab; title: string; requiresBusinessCase?: boolean }> = [
  { id: 'business-case', title: 'Business Case' },
  { id: 'decision-matrix', title: 'Decision Matrix', requiresBusinessCase: true },
  { id: 'roadmap', title: 'Roadmap', requiresBusinessCase: true },
];

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

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(objectUrl);
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('business-case');

  const {
    addDecisionOption,
    addRoadmapPhase,
    activeInitiativeId,
    assumptions,
    decisionMatrixError,
    decisionOptions,
    initiatives,
    isDecisionMatrixLoading,
    isDecisionMatrixSaving,
    isMarkdownExporting,
    hasDesktopBridge,
    initiativesError,
    isInitiativesLoading,
    isPreviewLoading,
    isRoadmapLoading,
    isRoadmapSaving,
    isSaving,
    isTemplateLibraryOpen,
    isTemplatesLoading,
    openInitiative,
    persistDecisionMatrix,
    persistBusinessCase,
    persistRoadmap,
    preview,
    previewError,
    selectedTemplate,
    selectedTemplateSlug,
    statusText,
    templates,
    templatesError,
    startDraft,
    loadTemplates,
    loadInitiativeList,
    openTemplateLibrary,
    removeDecisionOption,
    runPreview,
    setDecisionOption,
    setRoadmapPhase,
    setBusinessCaseMeta,
    setWorksheetLineValue,
    setSelectedTemplateSlug,
    roadmapError,
    roadmapPhases,
    removeRoadmapPhase,
    markdownExportError,
    exportMarkdown,
  } = useHomeWorkspace();

  const activeInitiative = useMemo(
    () => initiatives.find((initiative) => initiative.id === activeInitiativeId) ?? null,
    [activeInitiativeId, initiatives],
  );

  const hasBusinessCaseOutputs = !!preview && !!activeInitiativeId;

  const goToTab = (tab: WorkspaceTab) => {
    const tabConfig = WORKSPACE_TABS.find((item) => item.id === tab);

    if (!tabConfig) {
      return;
    }

    if (tabConfig.requiresBusinessCase && !hasBusinessCaseOutputs) {
      return;
    }

    setActiveTab(tab);
  };

  const saveAndContinueToDecisionMatrix = async () => {
    const didSave = await persistBusinessCase();

    if (didSave) {
      setActiveTab('decision-matrix');
    }
  };

  const saveDecisionMatrixAndContinue = async () => {
    const didSave = await persistDecisionMatrix();

    if (didSave) {
      setActiveTab('roadmap');
    }
  };

  const saveRoadmapAndReturnToBusinessCase = async () => {
    const didSave = await persistRoadmap();

    if (didSave) {
      setActiveTab('business-case');
    }
  };

  const handleExportMarkdown = async () => {
    const document = await exportMarkdown();

    if (!document) {
      return;
    }

    downloadTextFile(document.fileName, document.content);
  };

  const businessCaseSections = [
    {
      id: 'cost' as const,
      title: 'Costs',
      description: 'One-time and recurring implementation costs.',
      rows: assumptions.worksheet.costRows,
      section: preview?.sections.find((item) => item.id === 'cost') ?? null,
    },
    {
      id: 'benefit' as const,
      title: 'Benefits',
      description: 'Savings and value unlocked by the initiative.',
      rows: assumptions.worksheet.benefitRows,
      section: preview?.sections.find((item) => item.id === 'benefit') ?? null,
    },
    {
      id: 'mitigation' as const,
      title: 'Risk Mitigations',
      description: 'Risk-control investments tied to delivery and governance.',
      rows: assumptions.worksheet.mitigationRows,
      section: preview?.sections.find((item) => item.id === 'mitigation') ?? null,
    },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {!hasDesktopBridge ? (
        <section className="mb-6 rounded-2xl border border-amber-300/35 bg-amber-500/10 p-4 text-amber-100">
          <p className="text-sm font-semibold uppercase tracking-[0.14em]">Desktop Runtime Required</p>
          <p className="mt-2 text-sm">
            This page is running without the Electron preload bridge, so data loading and calculations are disabled.
            Start the desktop app with <span className="font-semibold">pnpm dev</span> from repo root and use the
            Electron window, not the browser tab.
          </p>
        </section>
      ) : null}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-brand-100/80">
              AI initiative workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              AI Decision Studio
            </h1>
            <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              by Menoko OG
            </p>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
              Premium desktop workspace for CTO and product/ops leaders evaluating AI initiatives.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-50">
            Offline-first. AI is optional.
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button className="gap-2" onClick={startDraft} disabled={!hasDesktopBridge}>
            <Sparkles className="size-4" />
            {activeInitiativeId ? 'Create Another Initiative' : 'Start Business Case'}
          </Button>
          <Button variant="outline" onClick={openTemplateLibrary} disabled={!hasDesktopBridge}>
            Open Template Library
          </Button>
          <Button variant="ghost" onClick={loadTemplates} disabled={!hasDesktopBridge}>
            Refresh Templates
          </Button>
          <Button variant="ghost" onClick={loadInitiativeList} disabled={!hasDesktopBridge}>
            Refresh Initiatives
          </Button>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
              hasDesktopBridge
                ? 'border-emerald-300/40 bg-emerald-500/10 text-emerald-100'
                : 'border-amber-300/35 bg-amber-500/10 text-amber-100'
            }`}
          >
            {hasDesktopBridge ? 'Desktop bridge connected' : 'Desktop bridge disconnected'}
          </span>
        </div>
        <p className="mt-4 text-sm text-brand-100/90">{statusText}</p>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-semibold">Saved Initiatives</h2>
        {initiativesError ? <p className="mt-2 text-sm text-rose-300">{initiativesError}</p> : null}
        {isInitiativesLoading ? (
          <p className="mt-2 text-sm text-slate-300">Loading initiatives...</p>
        ) : null}
        {initiatives.length === 0 && !isInitiativesLoading ? (
          <p className="mt-2 text-sm text-slate-300">
            No initiatives yet. Start one from a template.
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {initiatives.map((initiative) => (
            <Button
              key={initiative.id}
              variant={activeInitiativeId === initiative.id ? 'secondary' : 'outline'}
              onClick={() => openInitiative(initiative.id)}
            >
              {initiative.title}
            </Button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Initiative Workspace</h2>
          {activeInitiative ? (
            <p className="text-sm text-slate-300">
              Active: <span className="font-semibold text-slate-100">{activeInitiative.title}</span>
            </p>
          ) : (
            <p className="text-sm text-slate-300">Select or create an initiative to begin.</p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {WORKSPACE_TABS.map((tab, index) => {
            const disabled = !!tab.requiresBusinessCase && !hasBusinessCaseOutputs;

            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'secondary' : 'outline'}
                onClick={() => goToTab(tab.id)}
                disabled={disabled || !hasDesktopBridge}
              >
                {index + 1}. {tab.title}
              </Button>
            );
          })}
        </div>

        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
          Workflow: Fill Business Case and save, then continue into Decision Matrix and Roadmap.
        </p>
      </section>

      {activeTab === 'business-case' ? (
        <section className="mt-6 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-brand-900/25 p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Worksheet-Parity Business Case</h2>
                <p className="mt-1 text-sm text-slate-300">
                  Mirrors your course worksheet structure with deterministic year-by-year outputs.
                </p>
              </div>
              <span className="rounded-full border border-brand-500/40 bg-brand-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-100">
                Professional mode
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-slate-200">
                Baseline annual cost
                <input
                  className="rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 text-sm"
                  inputMode="decimal"
                  value={assumptions.baselineAnnualCost}
                  onChange={(event) => setBusinessCaseMeta('baselineAnnualCost', event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-200">
                Horizon years
                <input
                  className="rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 text-sm"
                  inputMode="numeric"
                  value={assumptions.horizonYears}
                  onChange={(event) => setBusinessCaseMeta('horizonYears', event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {businessCaseSections.map((section) => (
              <article
                key={section.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5"
              >
                <h3 className="text-base font-semibold">{section.title}</h3>
                <p className="mt-1 text-xs text-slate-400">{section.description}</p>

                <div className="mt-4 space-y-3">
                  {section.rows.map((row, rowIndex) => (
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
                            onChange={(event) =>
                              setWorksheetLineValue(section.id, rowIndex, 'oneTime', event.target.value)
                            }
                          />
                        </label>
                        <label className="text-xs text-slate-400">
                          Annual (Year 2+)
                          <input
                            className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/45 px-2 py-1.5 text-sm"
                            inputMode="decimal"
                            value={row.annual}
                            onChange={(event) =>
                              setWorksheetLineValue(section.id, rowIndex, 'annual', event.target.value)
                            }
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {section.section ? (
                  <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/45 p-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Section totals</p>
                    <p className="mt-2 font-semibold text-slate-100">{asCurrency(section.section.total)}</p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold">Deterministic Output</h3>
              <p className="mt-1 text-sm text-slate-300">
                Calculator-owned metrics remain auditable and reproducible.
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

                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-xs text-slate-300">
                      <thead className="text-slate-400">
                        <tr>
                          <th className="px-2 py-1">Year</th>
                          <th className="px-2 py-1 text-right">Net</th>
                          <th className="px-2 py-1 text-right">Running</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.yearLabels.map((label, index) => (
                          <tr key={label}>
                            <td className="px-2 py-1">{label}</td>
                            <td className="px-2 py-1 text-right">{asCurrency(preview.netYearTotals[index] ?? 0)}</td>
                            <td className="px-2 py-1 text-right">{asCurrency(preview.runningNetTotals[index] ?? 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-slate-300">Run calculation to view outputs.</p>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold">Actions</h3>
              <p className="mt-1 text-sm text-slate-300">
                Save assumptions to initiative history and continue workflow.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={runPreview} disabled={isPreviewLoading || isTemplatesLoading}>
                  {isPreviewLoading ? 'Calculating...' : 'Calculate Business Case'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={persistBusinessCase}
                  disabled={!activeInitiativeId || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Business Case'}
                </Button>
                <Button
                  variant="outline"
                  onClick={saveAndContinueToDecisionMatrix}
                  disabled={!activeInitiativeId || isSaving}
                >
                  Save and Continue
                </Button>
              </div>

              {previewError ? <p className="mt-3 text-sm text-rose-300">{previewError}</p> : null}
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === 'decision-matrix' ? (
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold">Decision Matrix</h2>
          <p className="mt-2 text-sm text-slate-300">
            Compare delivery options across cost, benefit, risk, and strategic fit.
          </p>

          {isDecisionMatrixLoading ? (
            <p className="mt-3 text-sm text-slate-300">Loading matrix...</p>
          ) : null}

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="px-3 py-2">Option</th>
                  <th className="px-3 py-2">Cost</th>
                  <th className="px-3 py-2">Benefit</th>
                  <th className="px-3 py-2">Risk</th>
                  <th className="px-3 py-2">Fit</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Recommendation</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {decisionOptions.map((option, index) => (
                  <tr key={`${option.id ?? 'draft'}-${index}`}>
                    <td className="px-3 py-2">
                      <input
                        className="w-44 rounded-lg border border-white/15 bg-slate-950/40 px-2 py-1 text-sm"
                        value={option.optionName}
                        onChange={(event) =>
                          setDecisionOption(index, 'optionName', event.target.value)
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-16 rounded-lg border border-white/15 bg-slate-950/40 px-2 py-1 text-sm"
                        type="number"
                        min={0}
                        max={10}
                        value={option.costScore}
                        onChange={(event) =>
                          setDecisionOption(index, 'costScore', Number(event.target.value))
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-16 rounded-lg border border-white/15 bg-slate-950/40 px-2 py-1 text-sm"
                        type="number"
                        min={0}
                        max={10}
                        value={option.benefitScore}
                        onChange={(event) =>
                          setDecisionOption(index, 'benefitScore', Number(event.target.value))
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-16 rounded-lg border border-white/15 bg-slate-950/40 px-2 py-1 text-sm"
                        type="number"
                        min={0}
                        max={10}
                        value={option.riskScore}
                        onChange={(event) =>
                          setDecisionOption(index, 'riskScore', Number(event.target.value))
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-16 rounded-lg border border-white/15 bg-slate-950/40 px-2 py-1 text-sm"
                        type="number"
                        min={0}
                        max={10}
                        value={option.fitScore}
                        onChange={(event) =>
                          setDecisionOption(index, 'fitScore', Number(event.target.value))
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {option.totalScore?.toFixed(2) ?? '-'}
                    </td>
                    <td className="px-3 py-2 text-slate-300">{option.recommendation ?? '-'}</td>
                    <td className="px-3 py-2">
                      <Button
                        variant="ghost"
                        onClick={() => removeDecisionOption(index)}
                        disabled={decisionOptions.length <= 1}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={addDecisionOption}>
              Add Option
            </Button>
            <Button
              variant="secondary"
              onClick={persistDecisionMatrix}
              disabled={!activeInitiativeId || isDecisionMatrixSaving}
            >
              {isDecisionMatrixSaving ? 'Saving Matrix...' : 'Save Decision Matrix'}
            </Button>
            {decisionMatrixError ? (
              <p className="text-sm text-rose-300">{decisionMatrixError}</p>
            ) : null}
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-400">
            Saved scores are weighted deterministically and linked to the active initiative.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => goToTab('business-case')}>
              Back to Business Case
            </Button>
            <Button
              variant="secondary"
              onClick={saveDecisionMatrixAndContinue}
              disabled={!hasBusinessCaseOutputs}
            >
              Continue to Roadmap
            </Button>
          </div>
        </section>
      ) : null}

      {activeTab === 'roadmap' ? (
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold">Roadmap Planner</h2>
          <p className="mt-2 text-sm text-slate-300">
            Sequence implementation from discovery to measurable outcomes.
          </p>

          {isRoadmapLoading ? (
            <p className="mt-3 text-sm text-slate-300">Loading roadmap...</p>
          ) : null}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {roadmapPhases.map((phase, index) => (
              <article
                key={`${phase.id ?? 'draft'}-${index}`}
                className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-brand-100/80">
                  Phase {index + 1}
                </p>
                <div className="mt-2 grid gap-2">
                  <input
                    className="rounded-lg border border-white/15 bg-slate-950/40 px-3 py-2 text-sm"
                    value={phase.title}
                    onChange={(event) => setRoadmapPhase(index, 'title', event.target.value)}
                    placeholder="Phase title"
                  />
                  <input
                    className="rounded-lg border border-white/15 bg-slate-950/40 px-3 py-2 text-sm"
                    value={phase.lane}
                    onChange={(event) => setRoadmapPhase(index, 'lane', event.target.value)}
                    placeholder="Lane"
                  />
                  <textarea
                    className="rounded-lg border border-white/15 bg-slate-950/40 px-3 py-2 text-sm"
                    rows={3}
                    value={phase.deliverables}
                    onChange={(event) => setRoadmapPhase(index, 'deliverables', event.target.value)}
                    placeholder="Deliverables"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs text-slate-400">
                      Start date
                      <input
                        className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/40 px-2 py-1 text-sm"
                        type="date"
                        value={phase.startDate ? phase.startDate.slice(0, 10) : ''}
                        onChange={(event) =>
                          setRoadmapPhase(
                            index,
                            'startDate',
                            event.target.value.length > 0 ? event.target.value : '',
                          )
                        }
                      />
                    </label>
                    <label className="text-xs text-slate-400">
                      End date
                      <input
                        className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/40 px-2 py-1 text-sm"
                        type="date"
                        value={phase.endDate ? phase.endDate.slice(0, 10) : ''}
                        onChange={(event) =>
                          setRoadmapPhase(
                            index,
                            'endDate',
                            event.target.value.length > 0 ? event.target.value : '',
                          )
                        }
                      />
                    </label>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      onClick={() => removeRoadmapPhase(index)}
                      disabled={roadmapPhases.length <= 1}
                    >
                      Remove Phase
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={addRoadmapPhase}>
              Add Phase
            </Button>
            <Button
              variant="secondary"
              onClick={persistRoadmap}
              disabled={!activeInitiativeId || isRoadmapSaving}
            >
              {isRoadmapSaving ? 'Saving Roadmap...' : 'Save Roadmap'}
            </Button>
            <Button
              variant="outline"
              onClick={handleExportMarkdown}
              disabled={!activeInitiativeId || isMarkdownExporting}
            >
              {isMarkdownExporting ? 'Exporting Markdown...' : 'Export Markdown'}
            </Button>
            {roadmapError ? <p className="text-sm text-rose-300">{roadmapError}</p> : null}
            {markdownExportError ? (
              <p className="text-sm text-rose-300">{markdownExportError}</p>
            ) : null}
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-400">
            Roadmap phases are now saved per initiative to continue planning over time.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => goToTab('decision-matrix')}>
              Back to Decision Matrix
            </Button>
            <Button variant="secondary" onClick={saveRoadmapAndReturnToBusinessCase}>
              Save and Return to Business Case
            </Button>
          </div>
        </section>
      ) : null}

      {isTemplateLibraryOpen ? (
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold">Built-in Template Library</h2>
          {templatesError ? <p className="mt-3 text-sm text-rose-300">{templatesError}</p> : null}
          {isTemplatesLoading ? (
            <p className="mt-3 text-sm text-slate-300">Loading templates...</p>
          ) : null}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {templates.map((template) => (
              <article
                key={template.slug}
                className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-brand-100/80">
                  {template.industry}
                </p>
                <h3 className="mt-2 text-base font-semibold">{template.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{template.summary}</p>
                <Button
                  className="mt-4"
                  variant={selectedTemplateSlug === template.slug ? 'secondary' : 'outline'}
                  onClick={() => setSelectedTemplateSlug(template.slug)}
                >
                  {selectedTemplateSlug === template.slug ? 'Selected' : 'Use Template'}
                </Button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {selectedTemplate ? (
        <section className="mt-6 rounded-3xl border border-brand-500/30 bg-brand-500/10 p-5">
          <h2 className="text-lg font-semibold text-brand-50">Selected Template</h2>
          <p className="mt-2 text-sm text-brand-100">{selectedTemplate.title}</p>
          <p className="mt-2 text-sm text-brand-100/90">{selectedTemplate.oneLiner}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-brand-100/80">
            Default phase: {selectedTemplate.defaultPhase}
          </p>
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([title, text]) => (
          <Card key={title} className="rounded-3xl border-white/10 bg-white/5">
            <CardHeader className="p-5 pb-2">
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <CardDescription className="text-sm leading-6 text-slate-300">{text}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-medium">v1 priorities</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>• High-quality exports</li>
            <li>• Deterministic business case calculations</li>
            <li>• Responsive narrow-width layouts</li>
            <li>• OpenAI-compatible provider setup</li>
            <li>• Built-in template library</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-medium">Connect AI later</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Users can connect their own supported API key to enable the Guarded AI Assistant. Core
            workflows remain available without AI.
          </p>
        </div>
      </section>
    </main>
  );
}
