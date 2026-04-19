import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
    BusinessCasePreviewInput,
    BusinessCasePreviewResult,
    BusinessCaseWorkspace,
    DecisionMatrixOptionInput,
    InitiativeSummary,
    RoadmapPhaseInput,
    TemplateSummary,
} from '../../../shared/ipc';
import {
    createInitiativeFromTemplate,
    getDecisionMatrix,
    getInitiativeWorkspace,
    listInitiatives,
    listTemplates,
    previewBusinessCase,
    getRoadmap,
    saveBusinessCase,
    saveDecisionMatrix,
    saveRoadmap,
} from './home-workspace-service';

type AssumptionField =
    | 'baselineAnnualCost'
    | 'expectedAnnualCostReduction'
    | 'implementationOneTimeCost'
    | 'implementationAnnualCost'
    | 'horizonYears';

type BusinessCaseAssumptions = {
    baselineAnnualCost: number;
    expectedAnnualCostReduction: number;
    implementationOneTimeCost: number;
    implementationAnnualCost: number;
    horizonYears: number;
};

type DecisionMatrixEditableOption = DecisionMatrixOptionInput & {
    id?: string;
    totalScore?: number;
    recommendation?: string;
};

type RoadmapEditablePhase = RoadmapPhaseInput & {
    id?: string;
    phaseNumber?: number;
    sortOrder?: number;
};

const initialAssumptions: BusinessCaseAssumptions = {
    baselineAnnualCost: 220000,
    expectedAnnualCostReduction: 140000,
    implementationOneTimeCost: 120000,
    implementationAnnualCost: 30000,
    horizonYears: 5,
};

const initialDecisionOptions: DecisionMatrixEditableOption[] = [
    {
        optionName: 'Build in-house',
        costScore: 6,
        benefitScore: 9,
        riskScore: 5,
        fitScore: 9,
        rationale: 'Higher control and strategic fit with moderate delivery risk.',
    },
    {
        optionName: 'Buy SaaS',
        costScore: 5,
        benefitScore: 7,
        riskScore: 3,
        fitScore: 6,
        rationale: 'Fastest launch with lower implementation risk but less customization.',
    },
    {
        optionName: 'Hybrid approach',
        costScore: 6,
        benefitScore: 8,
        riskScore: 4,
        fitScore: 8,
        rationale: 'Balances speed and control with integration overhead.',
    },
];

const initialRoadmapPhases: RoadmapEditablePhase[] = [
    {
        title: 'Discovery & Scope',
        lane: 'Planning',
        deliverables: 'Define KPI baseline, governance boundaries, and initiative success criteria.',
        startDate: null,
        endDate: null,
    },
    {
        title: 'Pilot & Validate',
        lane: 'Execution',
        deliverables: 'Run controlled pilot, collect KPI outcomes, and validate operational fit.',
        startDate: null,
        endDate: null,
    },
    {
        title: 'Scale & Operate',
        lane: 'Operations',
        deliverables: 'Roll out to production lanes and monitor value realization.',
        startDate: null,
        endDate: null,
    },
    {
        title: 'Govern & Improve',
        lane: 'Governance',
        deliverables: 'Review quarterly outcomes and update controls and roadmap.',
        startDate: null,
        endDate: null,
    },
];

function parseNumericInput(value: string) {
    if (value.trim() === '') {
        return 0;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

export function useHomeWorkspace() {
    const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
    const [isTemplatesLoading, setIsTemplatesLoading] = useState(true);
    const [templates, setTemplates] = useState<TemplateSummary[]>([]);
    const [templatesError, setTemplatesError] = useState<string | null>(null);

    const [initiatives, setInitiatives] = useState<InitiativeSummary[]>([]);
    const [isInitiativesLoading, setIsInitiativesLoading] = useState(true);
    const [initiativesError, setInitiativesError] = useState<string | null>(null);
    const [activeInitiativeId, setActiveInitiativeId] = useState<string | null>(null);

    const [selectedTemplateSlug, setSelectedTemplateSlug] = useState<string | null>(null);
    const [assumptions, setAssumptions] = useState<BusinessCaseAssumptions>(initialAssumptions);

    const [preview, setPreview] = useState<BusinessCasePreviewResult | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [decisionOptions, setDecisionOptions] = useState<DecisionMatrixEditableOption[]>(
        initialDecisionOptions,
    );
    const [isDecisionMatrixLoading, setIsDecisionMatrixLoading] = useState(false);
    const [isDecisionMatrixSaving, setIsDecisionMatrixSaving] = useState(false);
    const [decisionMatrixError, setDecisionMatrixError] = useState<string | null>(null);

    const [roadmapPhases, setRoadmapPhases] = useState<RoadmapEditablePhase[]>(initialRoadmapPhases);
    const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
    const [isRoadmapSaving, setIsRoadmapSaving] = useState(false);
    const [roadmapError, setRoadmapError] = useState<string | null>(null);

    const applyWorkspace = useCallback((workspace: BusinessCaseWorkspace) => {
        setActiveInitiativeId(workspace.initiative.id);
        setAssumptions(workspace.assumptions);
        setPreview(workspace.preview);

        if (workspace.initiative.templateSlug) {
            setSelectedTemplateSlug(workspace.initiative.templateSlug);
        }

        setInitiatives((previous) => {
            const withoutCurrent = previous.filter((item) => item.id !== workspace.initiative.id);
            return [workspace.initiative, ...withoutCurrent];
        });
    }, []);

    const loadInitiativeList = useCallback(async () => {
        setIsInitiativesLoading(true);
        setInitiativesError(null);

        try {
            const data = await listInitiatives();
            setInitiatives(data);

            if (data.length > 0) {
                setActiveInitiativeId((previous) => previous ?? data[0].id);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load initiatives.';
            setInitiativesError(message);
        } finally {
            setIsInitiativesLoading(false);
        }
    }, []);

    const loadDecisionMatrixForInitiative = useCallback(async (initiativeId: string) => {
        setIsDecisionMatrixLoading(true);
        setDecisionMatrixError(null);

        try {
            const matrix = await getDecisionMatrix(initiativeId);

            if (matrix.options.length === 0) {
                setDecisionOptions(initialDecisionOptions);
            } else {
                setDecisionOptions(
                    matrix.options.map((option) => ({
                        id: option.id,
                        optionName: option.optionName,
                        costScore: option.costScore,
                        benefitScore: option.benefitScore,
                        riskScore: option.riskScore,
                        fitScore: option.fitScore,
                        rationale: option.rationale,
                        totalScore: option.totalScore,
                        recommendation: option.recommendation,
                    })),
                );
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load decision matrix.';
            setDecisionMatrixError(message);
        } finally {
            setIsDecisionMatrixLoading(false);
        }
    }, []);

    const loadRoadmapForInitiative = useCallback(async (initiativeId: string) => {
        setIsRoadmapLoading(true);
        setRoadmapError(null);

        try {
            const roadmap = await getRoadmap(initiativeId);

            if (roadmap.phases.length === 0) {
                setRoadmapPhases(initialRoadmapPhases);
            } else {
                setRoadmapPhases(
                    roadmap.phases.map((phase) => ({
                        id: phase.id,
                        phaseNumber: phase.phaseNumber,
                        sortOrder: phase.sortOrder,
                        title: phase.title,
                        lane: phase.lane,
                        deliverables: phase.deliverables,
                        startDate: phase.startDate,
                        endDate: phase.endDate,
                    })),
                );
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load roadmap.';
            setRoadmapError(message);
        } finally {
            setIsRoadmapLoading(false);
        }
    }, []);

    const loadTemplates = useCallback(async () => {
        setIsTemplatesLoading(true);
        setTemplatesError(null);

        try {
            const data = await listTemplates();
            setTemplates(data);

            if (data.length > 0) {
                setSelectedTemplateSlug((previous) => previous ?? data[0].slug);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load templates.';
            setTemplatesError(message);
        } finally {
            setIsTemplatesLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadTemplates();
    }, [loadTemplates]);

    useEffect(() => {
        void loadInitiativeList();
    }, [loadInitiativeList]);

    const openInitiative = useCallback(
        async (initiativeId: string) => {
            setPreviewError(null);

            try {
                const workspace = await getInitiativeWorkspace(initiativeId);
                applyWorkspace(workspace);
                await loadDecisionMatrixForInitiative(initiativeId);
                await loadRoadmapForInitiative(initiativeId);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to open initiative.';
                setPreviewError(message);
            }
        },
        [applyWorkspace, loadDecisionMatrixForInitiative, loadRoadmapForInitiative],
    );

    useEffect(() => {
        if (activeInitiativeId) {
            void openInitiative(activeInitiativeId);
        }
    }, [activeInitiativeId, openInitiative]);

    const runPreview = useCallback(async () => {
        setIsPreviewLoading(true);
        setPreviewError(null);

        try {
            const result = await previewBusinessCase(assumptions);
            setPreview(result);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to calculate business case.';
            setPreviewError(message);
        } finally {
            setIsPreviewLoading(false);
        }
    }, [assumptions]);

    useEffect(() => {
        if (templates.length > 0) {
            void runPreview();
        }
    }, [templates.length, runPreview]);

    const statusText = useMemo(() => {
        if (initiativesError) {
            return `Initiative load error: ${initiativesError}`;
        }

        if (isTemplatesLoading) {
            return 'Loading built-in templates from local SQLite...';
        }

        if (templatesError) {
            return `Template load error: ${templatesError}`;
        }

        if (templates.length === 0) {
            return 'No templates found. Run the DB seed to initialize your template library.';
        }

        if (activeInitiativeId) {
            return `Loaded ${templates.length} templates and ${initiatives.length} saved initiatives.`;
        }

        return `Loaded ${templates.length} templates. Start a business case to create your first initiative.`;
    }, [
        activeInitiativeId,
        initiatives.length,
        initiativesError,
        isTemplatesLoading,
        templates.length,
        templatesError,
    ]);

    const selectedTemplate = useMemo(
        () => templates.find((template) => template.slug === selectedTemplateSlug) ?? null,
        [selectedTemplateSlug, templates],
    );

    const setAssumption = useCallback((field: AssumptionField, value: string) => {
        const parsed = parseNumericInput(value);

        setAssumptions((previous) => {
            if (field === 'horizonYears') {
                return {
                    ...previous,
                    [field]: Math.max(1, Math.trunc(parsed || 1)),
                };
            }

            return {
                ...previous,
                [field]: Math.max(0, parsed),
            };
        });
    }, []);

    const startDraft = useCallback(async () => {
        setIsTemplateLibraryOpen(false);
        setPreviewError(null);

        if (!selectedTemplateSlug) {
            setPreviewError('Select a template first before starting a business case.');
            return;
        }

        try {
            const workspace = await createInitiativeFromTemplate(selectedTemplateSlug);
            applyWorkspace(workspace);
            setDecisionOptions(initialDecisionOptions);
            setRoadmapPhases(initialRoadmapPhases);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create initiative.';
            setPreviewError(message);
        }
    }, [applyWorkspace, selectedTemplateSlug]);

    const openTemplateLibrary = useCallback(() => {
        setIsTemplateLibraryOpen(true);
    }, []);

    const persistBusinessCase = useCallback(async () => {
        if (!activeInitiativeId) {
            setPreviewError('Start a business case first to save assumptions.');
            return false;
        }

        setIsSaving(true);
        setPreviewError(null);

        try {
            const workspace = await saveBusinessCase(activeInitiativeId, assumptions as BusinessCasePreviewInput);
            applyWorkspace(workspace);
            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save business case.';
            setPreviewError(message);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [activeInitiativeId, assumptions, applyWorkspace]);

    const setDecisionOption = useCallback(
        (index: number, field: keyof DecisionMatrixEditableOption, value: string | number) => {
            setDecisionOptions((previous) =>
                previous.map((option, optionIndex) => {
                    if (optionIndex !== index) {
                        return option;
                    }

                    if (field === 'optionName' || field === 'rationale') {
                        return {
                            ...option,
                            [field]: String(value),
                        };
                    }

                    return {
                        ...option,
                        [field]: Math.max(0, Math.min(10, Number(value))),
                    };
                }),
            );
        },
        [],
    );

    const addDecisionOption = useCallback(() => {
        setDecisionOptions((previous) => [
            ...previous,
            {
                optionName: `Option ${previous.length + 1}`,
                costScore: 5,
                benefitScore: 5,
                riskScore: 5,
                fitScore: 5,
                rationale: '',
            },
        ]);
    }, []);

    const removeDecisionOption = useCallback((index: number) => {
        setDecisionOptions((previous) => previous.filter((_, optionIndex) => optionIndex !== index));
    }, []);

    const persistDecisionMatrix = useCallback(async () => {
        if (!activeInitiativeId) {
            setDecisionMatrixError('Select an initiative before saving decision matrix options.');
            return false;
        }

        const options = decisionOptions
            .map((option) => ({
                optionName: option.optionName.trim(),
                costScore: option.costScore,
                benefitScore: option.benefitScore,
                riskScore: option.riskScore,
                fitScore: option.fitScore,
                rationale: option.rationale?.trim() ?? '',
            }))
            .filter((option) => option.optionName.length > 0);

        if (options.length === 0) {
            setDecisionMatrixError('Add at least one named option before saving.');
            return false;
        }

        setIsDecisionMatrixSaving(true);
        setDecisionMatrixError(null);

        try {
            const savedMatrix = await saveDecisionMatrix(activeInitiativeId, options);
            setDecisionOptions(
                savedMatrix.options.map((option) => ({
                    id: option.id,
                    optionName: option.optionName,
                    costScore: option.costScore,
                    benefitScore: option.benefitScore,
                    riskScore: option.riskScore,
                    fitScore: option.fitScore,
                    rationale: option.rationale,
                    totalScore: option.totalScore,
                    recommendation: option.recommendation,
                })),
            );

            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save decision matrix.';
            setDecisionMatrixError(message);
            return false;
        } finally {
            setIsDecisionMatrixSaving(false);
        }
    }, [activeInitiativeId, decisionOptions]);

    const setRoadmapPhase = useCallback(
        (index: number, field: keyof RoadmapEditablePhase, value: string) => {
            setRoadmapPhases((previous) =>
                previous.map((phase, phaseIndex) => {
                    if (phaseIndex !== index) {
                        return phase;
                    }

                    return {
                        ...phase,
                        [field]: value,
                    };
                }),
            );
        },
        [],
    );

    const addRoadmapPhase = useCallback(() => {
        setRoadmapPhases((previous) => [
            ...previous,
            {
                title: `Phase ${previous.length + 1}`,
                lane: 'Execution',
                deliverables: '',
                startDate: null,
                endDate: null,
            },
        ]);
    }, []);

    const removeRoadmapPhase = useCallback((index: number) => {
        setRoadmapPhases((previous) => previous.filter((_, phaseIndex) => phaseIndex !== index));
    }, []);

    const persistRoadmap = useCallback(async () => {
        if (!activeInitiativeId) {
            setRoadmapError('Select an initiative before saving roadmap phases.');
            return false;
        }

        const phases = roadmapPhases
            .map((phase) => ({
                title: phase.title.trim(),
                lane: phase.lane.trim(),
                deliverables: phase.deliverables.trim(),
                startDate: phase.startDate && phase.startDate.length > 0 ? new Date(phase.startDate).toISOString() : null,
                endDate: phase.endDate && phase.endDate.length > 0 ? new Date(phase.endDate).toISOString() : null,
            }))
            .filter((phase) => phase.title.length > 0 && phase.lane.length > 0);

        if (phases.length === 0) {
            setRoadmapError('Add at least one roadmap phase with title and lane before saving.');
            return false;
        }

        setIsRoadmapSaving(true);
        setRoadmapError(null);

        try {
            const saved = await saveRoadmap(activeInitiativeId, phases);
            setRoadmapPhases(
                saved.phases.map((phase) => ({
                    id: phase.id,
                    phaseNumber: phase.phaseNumber,
                    sortOrder: phase.sortOrder,
                    title: phase.title,
                    lane: phase.lane,
                    deliverables: phase.deliverables,
                    startDate: phase.startDate,
                    endDate: phase.endDate,
                })),
            );

            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save roadmap.';
            setRoadmapError(message);
            return false;
        } finally {
            setIsRoadmapSaving(false);
        }
    }, [activeInitiativeId, roadmapPhases]);

    return {
        addDecisionOption,
        addRoadmapPhase,
        activeInitiativeId,
        assumptions,
        decisionMatrixError,
        decisionOptions,
        initiatives,
        initiativesError,
        isDecisionMatrixLoading,
        isDecisionMatrixSaving,
        isInitiativesLoading,
        isPreviewLoading,
        isRoadmapLoading,
        isRoadmapSaving,
        isSaving,
        isTemplateLibraryOpen,
        isTemplatesLoading,
        preview,
        previewError,
        selectedTemplate,
        selectedTemplateSlug,
        statusText,
        templates,
        templatesError,
        openInitiative,
        persistDecisionMatrix,
        persistBusinessCase,
        persistRoadmap,
        roadmapError,
        roadmapPhases,
        removeDecisionOption,
        removeRoadmapPhase,
        startDraft,
        loadTemplates,
        loadInitiativeList,
        openTemplateLibrary,
        runPreview,
        setDecisionOption,
        setRoadmapPhase,
        setAssumption,
        setSelectedTemplateSlug,
    };
}
