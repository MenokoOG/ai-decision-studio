'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calculator, Compass, Gauge, Layers3, Loader2, ShieldCheck, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionForm, type SectionStatus } from '@/components/section-form';
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
  | 'launcher'
  | 'quick-estimate'
  | 'scope'
  | 'costs'
  | 'benefits'
  | 'risks'
  | 'readiness'
  | 'summary';

type InitiativePhase = 'DISCOVERY' | 'DESIGN' | 'BUILD' | 'PILOT' | 'SCALE' | 'GOVERNANCE';

type InitiativeRecord = {
  id: string;
  title: string;
  summary: string;
  owner: string;
  phase: InitiativePhase;
};

type WorkspaceStatePayload = {
  input: BusinessCasePreviewInput;
  readiness: Record<string, { status: 'unknown' | 'draft' | 'ready' }>;
  activeScreen?: WorkflowScreen;
  quickEstimate?: {
    quickBaseline: number;
    quickReductionPercent: number;
    quickOneTime: number;
    quickAnnualRun: number;
    quickHorizon: number;
    monthlyActiveUsers: number;
    requestsPerUserPerMonth: number;
    avgPromptTokens: number;
    avgCompletionTokens: number;
    apiCostPer1kTokens: number;
  };
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

function getSectionTotal(preview: BusinessCasePreviewResult | null, sectionId: WorksheetSectionId) {
  return preview?.sections.find((item) => item.id === sectionId)?.total ?? null;
}

export default function HomePage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';
  const [initiatives, setInitiatives] = useState<InitiativeRecord[]>([]);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null);
  const [initiativeTitle, setInitiativeTitle] = useState('');
  const [initiativeSummary, setInitiativeSummary] = useState('');
  const [initiativeOwner, setInitiativeOwner] = useState('Menoko Team');
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoadingInitiatives, setIsLoadingInitiatives] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [workspaceBaselineHash, setWorkspaceBaselineHash] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<
    'idle' | 'pending' | 'saving' | 'saved' | 'error'
  >('idle');
  const [lastAutosaveAt, setLastAutosaveAt] = useState<string | null>(null);
  const [input, setInput] = useState<BusinessCasePreviewInput>(createDefaultBusinessCaseInput());
  const [preview, setPreview] = useState<BusinessCasePreviewResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<WorkflowScreen>('launcher');
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

  const apiV1 = (path: string) => `${apiBaseUrl || ''}/api/v1${path}`;

  const buildWorkspaceStatePayload = (): WorkspaceStatePayload => ({
    input,
    readiness,
    activeScreen,
    quickEstimate: {
      quickBaseline,
      quickReductionPercent,
      quickOneTime,
      quickAnnualRun,
      quickHorizon,
      monthlyActiveUsers,
      requestsPerUserPerMonth,
      avgPromptTokens,
      avgCompletionTokens,
      apiCostPer1kTokens,
    },
  });

  const hashWorkspaceState = (payload: WorkspaceStatePayload) => JSON.stringify(payload);

  const markWorkspaceSaved = (payload: WorkspaceStatePayload, savedAtIso: string) => {
    setWorkspaceBaselineHash(hashWorkspaceState(payload));
    setHasUnsavedChanges(false);
    setLastSavedAt(savedAtIso);
    setLastAutosaveAt(savedAtIso);
    setAutosaveStatus('saved');
  };

  const applyWorkspaceState = (payload: WorkspaceStatePayload) => {
    setInput(payload.input);
    setReadiness(payload.readiness);
    if (payload.activeScreen) {
      setActiveScreen(payload.activeScreen);
    }

    if (payload.quickEstimate) {
      setQuickBaseline(payload.quickEstimate.quickBaseline);
      setQuickReductionPercent(payload.quickEstimate.quickReductionPercent);
      setQuickOneTime(payload.quickEstimate.quickOneTime);
      setQuickAnnualRun(payload.quickEstimate.quickAnnualRun);
      setQuickHorizon(payload.quickEstimate.quickHorizon);
      setMonthlyActiveUsers(payload.quickEstimate.monthlyActiveUsers);
      setRequestsPerUserPerMonth(payload.quickEstimate.requestsPerUserPerMonth);
      setAvgPromptTokens(payload.quickEstimate.avgPromptTokens);
      setAvgCompletionTokens(payload.quickEstimate.avgCompletionTokens);
      setApiCostPer1kTokens(payload.quickEstimate.apiCostPer1kTokens);
    }
  };

  const loadInitiatives = async () => {
    setIsLoadingInitiatives(true);
    try {
      const response = await fetch(apiV1('/initiatives'));
      if (!response.ok) {
        throw new Error('Could not load initiatives.');
      }

      const data = (await response.json()) as InitiativeRecord[];
      setInitiatives(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load initiatives.');
    } finally {
      setIsLoadingInitiatives(false);
    }
  };

  const refreshConfidence = async (initiativeId: string) => {
    try {
      const response = await fetch(apiV1(`/initiatives/${initiativeId}/confidence`));
      if (!response.ok) {
        throw new Error('Could not load confidence score.');
      }

      const data = (await response.json()) as { confidenceScore: number };
      setConfidenceScore(data.confidenceScore);
    } catch {
      setConfidenceScore(null);
    }
  };

  const refreshSnapshotCount = async (initiativeId: string) => {
    try {
      const response = await fetch(apiV1(`/initiatives/${initiativeId}/snapshots`));
      if (!response.ok) {
        throw new Error('Could not load snapshots.');
      }

      const data = (await response.json()) as { snapshots: unknown[] };
      setSnapshotCount(data.snapshots.length);
    } catch {
      setSnapshotCount(0);
    }
  };

  const openInitiative = async (initiative: InitiativeRecord) => {
    setSelectedInitiativeId(initiative.id);
    setInitiativeTitle(initiative.title);
    setInitiativeSummary(initiative.summary);
    setInitiativeOwner(initiative.owner);

    try {
      const response = await fetch(apiV1(`/initiatives/${initiative.id}/workspace-state`));
      if (!response.ok) {
        throw new Error('Could not load workspace draft.');
      }

      const data = (await response.json()) as { state: WorkspaceStatePayload | null };
      if (data.state) {
        applyWorkspaceState(data.state);
        setWorkspaceBaselineHash(hashWorkspaceState(data.state));
        setHasUnsavedChanges(false);
        setAutosaveStatus('idle');
      }

      if (!data.state) {
        const currentPayload = buildWorkspaceStatePayload();
        setWorkspaceBaselineHash(hashWorkspaceState(currentPayload));
        setHasUnsavedChanges(false);
        setAutosaveStatus('idle');
      }

      await refreshConfidence(initiative.id);
      await refreshSnapshotCount(initiative.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load workspace draft.');
    }
  };

  const createInitiative = async () => {
    setError(null);

    if (
      initiativeTitle.trim().length < 3 ||
      initiativeSummary.trim().length < 3 ||
      initiativeOwner.trim().length < 2
    ) {
      setError('Please provide a title, summary, and owner before creating an initiative.');
      return;
    }

    try {
      const response = await fetch(apiV1('/initiatives'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: initiativeTitle.trim(),
          summary: initiativeSummary.trim(),
          owner: initiativeOwner.trim(),
          phase: 'DISCOVERY',
        }),
      });

      if (!response.ok) {
        throw new Error('Could not create initiative.');
      }

      const created = (await response.json()) as InitiativeRecord;
      await loadInitiatives();
      await openInitiative(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create initiative.');
    }
  };

  const saveWorkspaceDraft = async (options?: { silent?: boolean }) => {
    if (!selectedInitiativeId) {
      if (!options?.silent) {
        setError('Create or select an initiative before saving a draft.');
      }
      return;
    }

    if (!options?.silent) {
      setIsSavingDraft(true);
      setError(null);
      setAutosaveStatus('saving');
    } else {
      setAutosaveStatus('saving');
    }

    const payload = buildWorkspaceStatePayload();

    try {
      const response = await fetch(apiV1(`/initiatives/${selectedInitiativeId}/workspace-state`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Could not save workspace draft.');
      }

      const savedAtIso = new Date().toISOString();
      markWorkspaceSaved(payload, savedAtIso);
      await refreshConfidence(selectedInitiativeId);
    } catch (err) {
      setAutosaveStatus('error');
      if (!options?.silent) {
        setError(err instanceof Error ? err.message : 'Could not save workspace draft.');
      }
    } finally {
      if (!options?.silent) {
        setIsSavingDraft(false);
      }
    }
  };

  const saveSnapshot = async (result: BusinessCasePreviewResult) => {
    if (!selectedInitiativeId) {
      return;
    }

    try {
      const response = await fetch(apiV1(`/initiatives/${selectedInitiativeId}/snapshots`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          result,
          label: `snapshot-${new Date().toISOString()}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Could not save snapshot.');
      }

      await refreshSnapshotCount(selectedInitiativeId);
    } catch {
      // Keep the primary calculator UX resilient even if snapshot persistence fails.
    }
  };

  useEffect(() => {
    void loadInitiatives();
  }, []);

  useEffect(() => {
    if (selectedInitiativeId || initiatives.length === 0) {
      return;
    }

    void openInitiative(initiatives[0]);
  }, [initiatives, selectedInitiativeId]);

  useEffect(() => {
    if (!selectedInitiativeId || !workspaceBaselineHash) {
      return;
    }

    const currentHash = hashWorkspaceState(buildWorkspaceStatePayload());
    const dirty = currentHash !== workspaceBaselineHash;
    setHasUnsavedChanges(dirty);

    if (dirty) {
      setAutosaveStatus('pending');
    } else if (autosaveStatus === 'pending') {
      setAutosaveStatus('idle');
    }
  }, [
    activeScreen,
    apiCostPer1kTokens,
    avgCompletionTokens,
    avgPromptTokens,
    input,
    monthlyActiveUsers,
    quickAnnualRun,
    quickBaseline,
    quickHorizon,
    quickOneTime,
    quickReductionPercent,
    readiness,
    requestsPerUserPerMonth,
    selectedInitiativeId,
    workspaceBaselineHash,
  ]);

  useEffect(() => {
    if (!selectedInitiativeId || !hasUnsavedChanges) {
      return;
    }

    const timerId = window.setTimeout(() => {
      void saveWorkspaceDraft({ silent: true });
    }, 30000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    activeScreen,
    apiCostPer1kTokens,
    avgCompletionTokens,
    avgPromptTokens,
    input,
    monthlyActiveUsers,
    quickAnnualRun,
    quickBaseline,
    quickHorizon,
    quickOneTime,
    quickReductionPercent,
    readiness,
    requestsPerUserPerMonth,
    selectedInitiativeId,
    hasUnsavedChanges,
  ]);

  const autosaveLabel =
    autosaveStatus === 'saving'
      ? 'Autosave: saving...'
      : autosaveStatus === 'pending'
        ? 'Autosave: pending changes'
        : autosaveStatus === 'error'
          ? 'Autosave: failed'
          : lastAutosaveAt
            ? `Autosave: saved ${new Date(lastAutosaveAt).toLocaleTimeString()}`
            : 'Autosave: idle';

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

  const sectionStatus: Record<Exclude<WorkflowScreen, 'launcher'>, SectionStatus> = useMemo(() => {
    const anyRowFilled = (rows: BusinessCasePreviewInput['worksheet']['costRows']) =>
      rows.some((row) => row.oneTime > 0 || row.annual > 0);

    return {
      'quick-estimate':
        quickBaseline > 0 || quickOneTime > 0 || quickAnnualRun > 0 ? 'ready' : 'unknown',
      scope:
        input.baselineAnnualCost > 0 && input.horizonYears > 0
          ? 'ready'
          : input.baselineAnnualCost > 0 || input.horizonYears > 0
            ? 'draft'
            : 'unknown',
      costs: anyRowFilled(input.worksheet.costRows) ? 'ready' : 'unknown',
      benefits: anyRowFilled(input.worksheet.benefitRows) ? 'ready' : 'unknown',
      risks: anyRowFilled(input.worksheet.mitigationRows) ? 'ready' : 'unknown',
      readiness:
        readinessStats.readyCount > 0
          ? 'ready'
          : readinessStats.draftCount > 0
            ? 'draft'
            : 'unknown',
      summary: preview ? 'ready' : 'unknown',
    };
  }, [input, preview, quickAnnualRun, quickBaseline, quickOneTime, readinessStats]);

  const closeToLauncher = () => setActiveScreen('launcher');

  const clearScope = () =>
    setInput((previous) => ({
      ...previous,
      baselineAnnualCost: 0,
      horizonYears: 1,
    }));

  const clearWorksheetSection = (section: WorksheetSectionId) =>
    setInput((previous) => {
      const key =
        section === 'cost' ? 'costRows' : section === 'benefit' ? 'benefitRows' : 'mitigationRows';
      return {
        ...previous,
        worksheet: {
          ...previous.worksheet,
          [key]: previous.worksheet[key].map((row) => ({ ...row, oneTime: 0, annual: 0 })),
        },
      };
    });

  const clearReadiness = () => setReadiness(createDefaultReadinessState());

  const clearQuickEstimate = () => {
    setQuickBaseline(0);
    setQuickReductionPercent(0);
    setQuickOneTime(0);
    setQuickAnnualRun(0);
    setQuickHorizon(3);
    setMonthlyActiveUsers(0);
    setRequestsPerUserPerMonth(0);
    setAvgPromptTokens(0);
    setAvgCompletionTokens(0);
    setApiCostPer1kTokens(0);
  };

  const clearSummary = () => setPreview(null);

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
      [field]:
        field === 'horizonYears' ? Math.max(1, Math.trunc(parsed || 1)) : Math.max(0, parsed),
    }));
  };

  const setLine = (
    section: WorksheetSectionId,
    index: number,
    field: 'oneTime' | 'annual',
    value: string,
  ) => {
    const parsed = Math.max(0, parseNumeric(value));

    setInput((previous) => {
      const key =
        section === 'cost' ? 'costRows' : section === 'benefit' ? 'benefitRows' : 'mitigationRows';
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
        ...(previous[itemKey] ?? {}),
        status,
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

      const result = data as BusinessCasePreviewResult;
      setPreview(result);
      await saveSnapshot(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-white/20 bg-gradient-to-br from-[#132a57]/70 via-[#142344]/70 to-[#0f2131]/70 p-6 shadow-[0_20px_80px_rgba(2,12,27,0.45)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/90">
              Executive AI Portfolio Planning
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              AI Decision Studio
            </h1>
            <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              by Menoko OG
            </p>
            <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
              Model AI initiative cost, value, and delivery risk with deterministic outputs designed
              for executive decisions.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-300/35 bg-cyan-500/12 px-4 py-3 text-sm text-cyan-50">
            Live API-backed financial projections
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button className="gap-2" onClick={calculate} disabled={isCalculating}>
            <Sparkles className="size-4" />
            {isCalculating ? 'Calculating...' : 'Calculate Business Case'}
          </Button>
          <Button variant="outline" onClick={() => setActiveScreen('quick-estimate')}>
            Open Calculators
          </Button>
          <Button variant="outline" onClick={() => setInput(createDefaultBusinessCaseInput())}>
            Reset Template
          </Button>
          <span className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">
            Backend connected
          </span>
          <span className="rounded-full border border-slate-300/30 bg-slate-700/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-100">
            {selectedInitiativeId ? 'Initiative selected' : 'No initiative selected'}
          </span>
          <span className="rounded-full border border-slate-300/30 bg-slate-700/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-100">
            {lastSavedAt
              ? `Last saved ${new Date(lastSavedAt).toLocaleTimeString()}`
              : 'No draft saved yet'}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
              hasUnsavedChanges
                ? 'border border-amber-300/40 bg-amber-500/10 text-amber-100'
                : 'border border-emerald-300/40 bg-emerald-500/10 text-emerald-100'
            }`}
          >
            {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
              autosaveStatus === 'error'
                ? 'border border-rose-300/40 bg-rose-500/10 text-rose-100'
                : autosaveStatus === 'saving'
                  ? 'border border-sky-300/40 bg-sky-500/10 text-sky-100'
                  : 'border border-slate-300/30 bg-slate-700/20 text-slate-100'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {autosaveStatus === 'saving' ? (
                <span
                  className="size-1.5 rounded-full bg-current animate-pulse"
                  aria-hidden="true"
                />
              ) : null}
              {autosaveLabel}
            </span>
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/15 bg-[#0b1733]/65 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Workspace</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">
              {selectedInitiativeId ? 'Initiative active' : 'No initiative selected'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-[#0b1733]/65 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Readiness</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">
              {readinessStats.completionPercent.toFixed(0)}% complete
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-[#0b1733]/65 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Confidence score</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">
              {confidenceScore === null
                ? 'Pending checklist data'
                : `${confidenceScore.toFixed(1)}%`}
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-[#0b1733]/65 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Snapshots</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">
              {snapshotCount} saved versions
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-sky-300/30 bg-sky-500/10 p-4 text-sm text-sky-100">
          <p className="font-semibold">Decision-grade outputs</p>
          <p className="mt-1">
            Calculations remain deterministic, auditable, and aligned to worksheet parity for
            reliable board-level discussions.
          </p>
        </div>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      </section>

      <section className="mt-6 rounded-3xl border border-white/15 bg-[#0f1a35]/55 p-5 backdrop-blur-sm">
        <h2 className="text-lg font-semibold">Project Workspace</h2>
        <p className="mt-1 text-sm text-slate-300">
          Create or open an initiative to persist this workflow between sessions.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-slate-200">
            Initiative title
            <input
              className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
              value={initiativeTitle}
              onChange={(event) => setInitiativeTitle(event.target.value)}
            />
          </label>
          <label className="text-sm text-slate-200">
            Owner
            <input
              className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
              value={initiativeOwner}
              onChange={(event) => setInitiativeOwner(event.target.value)}
            />
          </label>
          <label className="text-sm text-slate-200 sm:col-span-2">
            Summary
            <textarea
              className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
              rows={2}
              value={initiativeSummary}
              onChange={(event) => setInitiativeSummary(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={createInitiative}>Create Initiative</Button>
          <Button
            variant="outline"
            onClick={() => void saveWorkspaceDraft()}
            disabled={isSavingDraft || !selectedInitiativeId}
          >
            {isSavingDraft ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Saving draft...
              </span>
            ) : (
              'Save Draft'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => void loadInitiatives()}
            disabled={isLoadingInitiatives}
          >
            {isLoadingInitiatives ? 'Refreshing...' : 'Refresh List'}
          </Button>
        </div>

        <div className="mt-3 grid gap-2 rounded-2xl border border-white/10 bg-slate-950/35 p-3 text-xs text-slate-300 sm:grid-cols-3">
          <p>Auto-save: every 30 seconds</p>
          <p>
            Confidence score: {confidenceScore === null ? 'n/a' : `${confidenceScore.toFixed(1)}%`}
          </p>
          <p>Snapshots saved: {snapshotCount}</p>
        </div>

        <div className="mt-4 grid gap-2">
          {initiatives.length === 0 ? (
            <p className="text-sm text-slate-400">
              No initiatives yet. Create one to enable save/load.
            </p>
          ) : (
            initiatives.map((initiative) => (
              <button
                key={initiative.id}
                type="button"
                className={`rounded-xl border p-3 text-left transition ${
                  selectedInitiativeId === initiative.id
                    ? 'border-brand-400/70 bg-brand-500/15'
                    : 'border-white/10 bg-slate-950/30 hover:border-white/25'
                }`}
                onClick={() => void openInitiative(initiative)}
              >
                <p className="text-sm font-semibold text-slate-100">{initiative.title}</p>
                <p className="mt-1 text-xs text-slate-400">Owner: {initiative.owner}</p>
                <p className="mt-1 text-xs text-slate-400">{initiative.summary}</p>
              </button>
            ))
          )}
        </div>
      </section>

      {activeScreen === 'launcher' ? (
        <section className="mt-6 rounded-3xl border border-white/15 bg-[#0f1a35]/55 p-5 backdrop-blur-sm">
          <h2 className="text-lg font-semibold">Workspace Launcher</h2>
          <p className="mt-1 text-sm text-slate-300">
            Open one section at a time, complete it, and close back to this hub. Status pills show
            what is started, in progress, and ready.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {workflowScreens.map((screen, index) => {
              const status = sectionStatus[screen.id as Exclude<WorkflowScreen, 'launcher'>];
              const pillClass =
                status === 'ready'
                  ? 'border-emerald-300/40 bg-emerald-500/10 text-emerald-100'
                  : status === 'draft'
                    ? 'border-amber-300/40 bg-amber-500/10 text-amber-100'
                    : 'border-slate-300/30 bg-slate-700/20 text-slate-200';
              const pillLabel =
                status === 'ready' ? 'Ready' : status === 'draft' ? 'Draft' : 'Not started';
              return (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => setActiveScreen(screen.id)}
                  className="group rounded-xl border border-white/10 bg-slate-950/30 p-3 text-left transition hover:border-white/25 hover:bg-slate-900/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                      Step {index + 1}
                    </p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${pillClass}`}
                    >
                      {pillLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-100">{screen.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{screen.tip}</p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200/80 group-hover:text-cyan-100">
                    Open &rarr;
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {activeScreen === 'launcher' ? (
      <section className="mt-6 rounded-3xl border border-white/15 bg-[#0f1a35]/55 p-5 backdrop-blur-sm">
        <h2 className="text-lg font-semibold">Use Cases</h2>
        <p className="mt-1 text-sm text-slate-300">
          Use this tool before committing budget, selecting architecture, or presenting AI
          investment tradeoffs to leadership.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <h3 className="text-sm font-semibold text-slate-100">Prioritize AI initiatives</h3>
            <p className="mt-1 text-xs text-slate-400">
              Compare likely value and costs before selecting what to fund first.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <h3 className="text-sm font-semibold text-slate-100">Plan enterprise modernization</h3>
            <p className="mt-1 text-xs text-slate-400">
              Model delivery risk and operational readiness across legacy integration paths.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <h3 className="text-sm font-semibold text-slate-100">Prepare board-level updates</h3>
            <p className="mt-1 text-xs text-slate-400">
              Share deterministic totals, payback outlook, and readiness gaps with confidence.
            </p>
          </article>
        </div>
      </section>
      ) : null}

      {activeScreen === 'launcher' ? (
      <section className="mt-6 rounded-3xl border border-white/15 bg-[#0f1a35]/55 p-5 backdrop-blur-sm">
        <h2 className="text-lg font-semibold">Help: How To Use This App</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <h3 className="text-sm font-semibold text-slate-100">1. Start in Quick Estimate</h3>
            <p className="mt-1 text-xs text-slate-400">
              Open the Quick Estimate screen to run directional numbers and usage scaling costs
              first.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <h3 className="text-sm font-semibold text-slate-100">2. Fill Scope and Worksheet</h3>
            <p className="mt-1 text-xs text-slate-400">
              Enter baseline, then complete Costs, Benefits, and Risk Mitigations with one-time and
              annual values.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <h3 className="text-sm font-semibold text-slate-100">3. Track Readiness</h3>
            <p className="mt-1 text-xs text-slate-400">
              Mark each readiness area as Unknown, Draft, or Ready to surface delivery risk early.
            </p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <h3 className="text-sm font-semibold text-slate-100">
              4. Calculate and Review Summary
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Use Calculate to refresh deterministic totals, ROI, payback, and yearly net
              projections.
            </p>
          </article>
        </div>
        <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-4 text-xs text-cyan-100">
          Formula note: Year 1 includes one-time plus annual values. Years 2+ include annual values
          only. Running totals are cumulative year-over-year.
        </div>
      </section>
      ) : null}

      {activeScreen === 'quick-estimate' ? (
        <SectionForm
          title="Quick Estimate"
          description="Rough what-if analysis before completing worksheet details. This is the first calculator section."
          icon={<Calculator className="size-5" />}
          status={sectionStatus['quick-estimate']}
          onSave={() => void saveWorkspaceDraft()}
          onCalculate={calculate}
          onClear={clearQuickEstimate}
          onClose={closeToLauncher}
          isSaving={isSavingDraft}
          isCalculating={isCalculating}
          clearConfirmMessage="Reset all quick-estimate inputs to zero?"
        >
          <div id="calculators" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm text-slate-200">
              Current annual spend
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                inputMode="decimal"
                value={quickBaseline}
                onChange={(event) =>
                  setQuickBaseline(Math.max(0, parseNumeric(event.target.value)))
                }
              />
              <span className="mt-1 block text-xs text-slate-400">
                How much you spend each year today before this AI project.
              </span>
            </label>
            <label className="text-sm text-slate-200">
              Savings target (%)
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                inputMode="decimal"
                value={quickReductionPercent}
                onChange={(event) =>
                  setQuickReductionPercent(Math.max(0, parseNumeric(event.target.value)))
                }
              />
              <span className="mt-1 block text-xs text-slate-400">
                Percent of current spend you aim to save after rollout.
              </span>
            </label>
            <label className="text-sm text-slate-200">
              One-time investment
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                inputMode="decimal"
                value={quickOneTime}
                onChange={(event) => setQuickOneTime(Math.max(0, parseNumeric(event.target.value)))}
              />
              <span className="mt-1 block text-xs text-slate-400">
                Money you spend once to start the project.
              </span>
            </label>
            <label className="text-sm text-slate-200">
              Annual run cost
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                inputMode="decimal"
                value={quickAnnualRun}
                onChange={(event) =>
                  setQuickAnnualRun(Math.max(0, parseNumeric(event.target.value)))
                }
              />
              <span className="mt-1 block text-xs text-slate-400">
                Money you keep paying each year after launch.
              </span>
            </label>
            <label className="text-sm text-slate-200">
              Planning years
              <input
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                inputMode="numeric"
                value={quickHorizon}
                onChange={(event) =>
                  setQuickHorizon(Math.max(1, Math.trunc(parseNumeric(event.target.value) || 1)))
                }
              />
              <span className="mt-1 block text-xs text-slate-400">
                How many years you want to model in this estimate.
              </span>
            </label>
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-slate-950/35 p-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">
                Projected annual benefit
              </dt>
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
              AI behaves like metered infrastructure. Forecast usage at scale before committing
              architecture.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm text-slate-200">
                Monthly active users
                <input
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                  inputMode="numeric"
                  value={monthlyActiveUsers}
                  onChange={(event) =>
                    setMonthlyActiveUsers(Math.max(0, Math.trunc(parseNumeric(event.target.value))))
                  }
                />
                <span className="mt-1 block text-xs text-slate-400">
                  Estimated users who will use the AI feature each month.
                </span>
              </label>
              <label className="text-sm text-slate-200">
                Requests per user / month
                <input
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                  inputMode="numeric"
                  value={requestsPerUserPerMonth}
                  onChange={(event) =>
                    setRequestsPerUserPerMonth(
                      Math.max(0, Math.trunc(parseNumeric(event.target.value))),
                    )
                  }
                />
                <span className="mt-1 block text-xs text-slate-400">
                  Average prompts each user sends per month.
                </span>
              </label>
              <label className="text-sm text-slate-200">
                Avg prompt tokens / request
                <input
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                  inputMode="numeric"
                  value={avgPromptTokens}
                  onChange={(event) =>
                    setAvgPromptTokens(Math.max(0, Math.trunc(parseNumeric(event.target.value))))
                  }
                />
                <span className="mt-1 block text-xs text-slate-400">
                  Input token size per request before model response.
                </span>
              </label>
              <label className="text-sm text-slate-200">
                Avg completion tokens / request
                <input
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                  inputMode="numeric"
                  value={avgCompletionTokens}
                  onChange={(event) =>
                    setAvgCompletionTokens(
                      Math.max(0, Math.trunc(parseNumeric(event.target.value))),
                    )
                  }
                />
                <span className="mt-1 block text-xs text-slate-400">
                  Output token size generated by the model each request.
                </span>
              </label>
              <label className="text-sm text-slate-200">
                API cost per 1K tokens (USD)
                <input
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                  inputMode="decimal"
                  value={apiCostPer1kTokens}
                  onChange={(event) =>
                    setApiCostPer1kTokens(Math.max(0, parseNumeric(event.target.value)))
                  }
                />
                <span className="mt-1 block text-xs text-slate-400">
                  Provider price in dollars for each 1,000 tokens.
                </span>
              </label>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">
                  Monthly requests
                </dt>
                <dd className="text-base font-semibold">
                  {usageScaleEstimate.monthlyRequests.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">
                  Tokens per request
                </dt>
                <dd className="text-base font-semibold">
                  {usageScaleEstimate.tokensPerRequest.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">
                  Monthly tokens
                </dt>
                <dd className="text-base font-semibold">
                  {usageScaleEstimate.monthlyTokens.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">
                  Monthly API cost
                </dt>
                <dd className="text-base font-semibold">
                  {asCurrency(usageScaleEstimate.monthlyApiCost)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.12em] text-slate-400">
                  Annual API cost
                </dt>
                <dd className="text-base font-semibold">
                  {asCurrency(usageScaleEstimate.annualApiCost)}
                </dd>
              </div>
            </dl>
          </div>
        </SectionForm>
      ) : null}

      {activeScreen === 'scope' ? (
        <SectionForm
          title="Scope & Baseline"
          description="Set your baseline first so downstream cost and value projections stay grounded."
          icon={<Compass className="size-5" />}
          status={sectionStatus.scope}
          onSave={() => void saveWorkspaceDraft()}
          onCalculate={calculate}
          onClear={clearScope}
          onClose={closeToLauncher}
          isSaving={isSavingDraft}
          isCalculating={isCalculating}
          clearConfirmMessage="Reset baseline cost and horizon to defaults?"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              Baseline annual cost
              <input
                className="rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                inputMode="decimal"
                value={input.baselineAnnualCost}
                onChange={(event) => setMeta('baselineAnnualCost', event.target.value)}
              />
              <span className="text-xs text-slate-400">
                Current yearly spend before this initiative. Example: existing team and tooling
                cost.
              </span>
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              Horizon years
              <input
                className="rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2"
                inputMode="numeric"
                value={input.horizonYears}
                onChange={(event) => setMeta('horizonYears', event.target.value)}
              />
              <span className="text-xs text-slate-400">
                How many years to project for totals, ROI, and payback.
              </span>
            </label>
          </div>
        </SectionForm>
      ) : null}

      {activeScreen === 'costs' || activeScreen === 'benefits' || activeScreen === 'risks' ? (
        (() => {
          const sectionId: WorksheetSectionId =
            activeScreen === 'costs' ? 'cost' : activeScreen === 'benefits' ? 'benefit' : 'mitigation';
          const screenMeta = {
            costs: {
              title: 'Implementation Costs',
              description:
                'Capture one-time and annual costs for the full delivery footprint.',
              clearMessage: 'Zero out all cost rows? Row labels stay; only values reset.',
            },
            benefits: {
              title: 'Business Benefits',
              description:
                'Estimate measurable savings, productivity, and differentiation value.',
              clearMessage: 'Zero out all benefit rows? Row labels stay; only values reset.',
            },
            risks: {
              title: 'Risk Mitigations',
              description:
                'Budget explicit risk controls before finalizing investment decisions.',
              clearMessage: 'Zero out all mitigation rows? Row labels stay; only values reset.',
            },
          }[activeScreen];
          return (
            <SectionForm
              title={screenMeta.title}
              description={screenMeta.description}
              icon={<Layers3 className="size-5" />}
              status={sectionStatus[activeScreen]}
              onSave={() => void saveWorkspaceDraft()}
              onCalculate={calculate}
              onClear={() => clearWorksheetSection(sectionId)}
              onClose={closeToLauncher}
              isSaving={isSavingDraft}
              isCalculating={isCalculating}
              clearConfirmMessage={screenMeta.clearMessage}
            >
              <div className="grid gap-4">
                {sections
                  .filter((section) => section.id === sectionId)
                  .map((section) => (
                    <article key={section.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-300">{section.subtitle}</p>
                      <div className="mt-2 rounded-xl border border-amber-300/25 bg-amber-500/10 p-3 text-xs text-amber-100">
                        Enter Year 1 setup spend under one-time, then steady-state spend/value
                        under annual.
                      </div>

                      <div className="mt-4 space-y-3">
                        {section.rows.map((row, index) => (
                          <div
                            key={row.key}
                            className="rounded-2xl border border-white/10 bg-slate-950/35 p-3"
                          >
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
                                    setLine(section.id, index, 'oneTime', event.target.value)
                                  }
                                />
                                <span className="mt-1 block text-[11px] text-slate-500">
                                  Used in Year 1 only.
                                </span>
                              </label>
                              <label className="text-xs text-slate-400">
                                Annual (Year 2+)
                                <input
                                  className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950/45 px-2 py-1.5 text-sm"
                                  inputMode="decimal"
                                  value={row.annual}
                                  onChange={(event) =>
                                    setLine(section.id, index, 'annual', event.target.value)
                                  }
                                />
                                <span className="mt-1 block text-[11px] text-slate-500">
                                  Repeats every year after Year 1.
                                </span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
              </div>
            </SectionForm>
          );
        })()
      ) : null}

      {activeScreen === 'readiness' ? (
        <SectionForm
          title="AI Cost Readiness Checklist"
          description="Make hidden cost and execution complexity visible early. Mark each item as Unknown, Draft, or Ready."
          icon={<ShieldCheck className="size-5" />}
          status={sectionStatus.readiness}
          onSave={() => void saveWorkspaceDraft()}
          onCalculate={calculate}
          onClear={clearReadiness}
          onClose={closeToLauncher}
          isSaving={isSavingDraft}
          isCalculating={isCalculating}
          clearConfirmMessage="Reset every readiness item back to Unknown?"
        >
          <p className="text-xs text-slate-400">
            Unknown = not assessed yet, Draft = in progress, Ready = validated with owner and
            evidence.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-3 text-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-emerald-200/80">Ready</p>
              <p className="mt-1 text-lg font-semibold text-emerald-100">
                {readinessStats.readyCount}
              </p>
            </div>
            <div className="rounded-2xl border border-sky-300/20 bg-sky-500/10 p-3 text-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-sky-200/80">Draft</p>
              <p className="mt-1 text-lg font-semibold text-sky-100">{readinessStats.draftCount}</p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-3 text-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-amber-200/80">Unknown</p>
              <p className="mt-1 text-lg font-semibold text-amber-100">
                {readinessStats.unknownCount}
              </p>
            </div>
            <div className="rounded-2xl border border-violet-300/20 bg-violet-500/10 p-3 text-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-violet-200/80">Completion</p>
              <p className="mt-1 text-lg font-semibold text-violet-100">
                {readinessStats.completionPercent.toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {READINESS_ITEMS.map((item) => {
              const state = readiness[item.key] ?? { status: 'unknown' };
              return (
                <article
                  key={item.key}
                  className="rounded-2xl border border-white/10 bg-slate-950/35 p-3"
                >
                  <p className="text-sm font-semibold text-slate-100">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.description}</p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`rounded-lg border px-2 py-1 text-xs ${
                        state.status === 'unknown'
                          ? 'border-amber-300/60 bg-amber-500/20 text-amber-100'
                          : 'border-white/10 bg-slate-900/45'
                      }`}
                      onClick={() => setReadinessStatus(item.key, 'unknown')}
                    >
                      Unknown
                    </button>
                    <button
                      type="button"
                      className={`rounded-lg border px-2 py-1 text-xs ${
                        state.status === 'draft'
                          ? 'border-sky-300/60 bg-sky-500/20 text-sky-100'
                          : 'border-white/10 bg-slate-900/45'
                      }`}
                      onClick={() => setReadinessStatus(item.key, 'draft')}
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      className={`rounded-lg border px-2 py-1 text-xs ${
                        state.status === 'ready'
                          ? 'border-emerald-300/60 bg-emerald-500/20 text-emerald-100'
                          : 'border-white/10 bg-slate-900/45'
                      }`}
                      onClick={() => setReadinessStatus(item.key, 'ready')}
                    >
                      Ready
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </SectionForm>
      ) : null}

      {activeScreen === 'summary' ? (
        <SectionForm
          title="Decision Summary"
          description="Deterministic outputs from worksheet inputs. No AI guesswork in the numbers."
          icon={<Gauge className="size-5" />}
          status={sectionStatus.summary}
          onCalculate={calculate}
          onClear={clearSummary}
          onClose={closeToLauncher}
          isCalculating={isCalculating}
          clearConfirmMessage="Clear the calculated summary? Inputs are not affected."
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-white/15 bg-[#0f1a35]/55 p-5 backdrop-blur-sm">
            <p className="mt-1 text-sm text-slate-300">
              Deterministic outputs from worksheet inputs. No AI guesswork in the numbers.
            </p>

            {preview ? (
              <>
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-slate-400">Total cost of ownership</dt>
                  <dd className="text-right font-semibold">
                    {asCurrency(preview.totalCostOfOwnership)}
                  </dd>
                  <dt className="text-slate-400">Total benefit</dt>
                  <dd className="text-right font-semibold">{asCurrency(preview.totalBenefit)}</dd>
                  <dt className="text-slate-400">Net value</dt>
                  <dd className="text-right font-semibold">{asCurrency(preview.netValue)}</dd>
                  <dt className="text-slate-400">Net annual benefit</dt>
                  <dd className="text-right font-semibold">
                    {asCurrency(preview.netAnnualBenefit)}
                  </dd>
                  <dt className="text-slate-400">ROI</dt>
                  <dd className="text-right font-semibold">{asPercent(preview.roiPercent)}</dd>
                  <dt className="text-slate-400">Payback</dt>
                  <dd className="text-right font-semibold">{asMonths(preview.paybackMonths)}</dd>
                </dl>
                <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/30 p-3 text-xs text-slate-300">
                  <p>ROI shows how much value you get back compared to what you spend.</p>
                  <p className="mt-1">
                    Payback shows when cumulative gains recover your initial investment.
                  </p>
                </div>
                <div className="mt-4 grid gap-2 rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm">
                  <p>Cost section total: {asCurrency(getSectionTotal(preview, 'cost'))}</p>
                  <p>Benefit section total: {asCurrency(getSectionTotal(preview, 'benefit'))}</p>
                  <p>Risk mitigation total: {asCurrency(getSectionTotal(preview, 'mitigation'))}</p>
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm">
                  <p className="font-semibold">Readiness Snapshot</p>
                  <p className="mt-1">
                    Ready items: {readinessStats.readyCount} / {READINESS_ITEMS.length}
                  </p>
                  <p>Open gaps (unknown): {readinessStats.unknownCount}</p>
                  <p>
                    Scale estimate annual API cost: {asCurrency(usageScaleEstimate.annualApiCost)}
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-300">
                Press calculate to view deterministic outputs.
              </p>
            )}
          </div>

          <Card className="rounded-3xl border-white/15 bg-[#0f1a35]/55 backdrop-blur-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="flex items-center gap-2">
                <Compass className="size-4" />
                Guided Next Step
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-300">
                Future agentic capability will suggest platform options, modern data points, and
                tradeoffs based on what users enter in each step.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0 text-sm text-slate-300">
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-slate-950/30 p-3">
                  <Gauge className="mt-0.5 size-4 text-cyan-200" />
                  <p>
                    Use summary metrics to decide whether this initiative should move to pilot,
                    redesign, or pause.
                  </p>
                </div>
                <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-slate-950/30 p-3">
                  <Layers3 className="mt-0.5 size-4 text-violet-200" />
                  <p>
                    Save snapshots after each major assumption shift to track how strategy changes
                    impact ROI.
                  </p>
                </div>
                <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-slate-950/30 p-3">
                  <ShieldCheck className="mt-0.5 size-4 text-emerald-200" />
                  <p>
                    Treat unknown readiness items as execution risk until cost ownership and
                    controls are defined.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </SectionForm>
      ) : null}

      {activeScreen === 'launcher' ? (
        <section className="mt-6 rounded-3xl border border-white/15 bg-[#0f1a35]/55 p-5 backdrop-blur-sm">
          <h2 className="text-lg font-semibold">Recalculate From Here</h2>
          <p className="mt-1 text-sm text-slate-300">
            You do not need to scroll back up. Use this button anytime after editing fields.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button className="gap-2" onClick={calculate} disabled={isCalculating}>
              <Sparkles className="size-4" />
              {isCalculating ? 'Calculating...' : 'Calculate Business Case'}
            </Button>
            <Button variant="outline" onClick={() => setActiveScreen('summary')}>
              Open Decision Summary
            </Button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
