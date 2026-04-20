export const IPC_CHANNELS = {
    listTemplates: 'templates:list',
    previewBusinessCase: 'business-case:preview',
    createInitiativeFromTemplate: 'initiative:create-from-template',
    listInitiatives: 'initiative:list',
    getInitiativeWorkspace: 'initiative:get-workspace',
    saveBusinessCase: 'business-case:save',
    getDecisionMatrix: 'decision-matrix:get',
    saveDecisionMatrix: 'decision-matrix:save',
    getRoadmap: 'roadmap:get',
    saveRoadmap: 'roadmap:save',
    exportInitiativeMarkdown: 'export:initiative-markdown',
} as const;

export interface TemplateSummary {
    id: string;
    slug: string;
    title: string;
    industry: string;
    summary: string;
    oneLiner: string;
    defaultPhase: string;
}

export type WorksheetSectionId = 'cost' | 'benefit' | 'mitigation';

export interface WorksheetLineInput {
    key: string;
    label: string;
    description: string;
    oneTime: number;
    annual: number;
}

export interface WorksheetRowTemplate {
    key: string;
    label: string;
    description: string;
}

export interface BusinessCaseWorksheetInput {
    costRows: WorksheetLineInput[];
    benefitRows: WorksheetLineInput[];
    mitigationRows: WorksheetLineInput[];
}

export const WORKSHEET_ROW_TEMPLATES: Record<WorksheetSectionId, WorksheetRowTemplate[]> = {
    cost: [
        {
            key: 'data-acquisition',
            label: 'Data acquisition',
            description: 'Costs of curating data with quality, quantity, and completeness.',
        },
        {
            key: 'data-science-training',
            label: 'Data Science including training',
            description: 'Cost of data science R&D and model training.',
        },
        {
            key: 'engineering',
            label: 'Engineering',
            description: 'Technology expense to build and integrate product capabilities.',
        },
        {
            key: 'infrastructure',
            label: 'Infrastructure',
            description: 'Cost to support technology infrastructure.',
        },
        {
            key: 'ai-api',
            label: 'AI API',
            description: 'Ongoing API and model inference costs.',
        },
        {
            key: 'operations-business',
            label: 'Operations / business',
            description: 'Business operations and rollout support costs.',
        },
        {
            key: 'technical-support',
            label: 'Technical support',
            description: 'Post-launch support and maintenance effort.',
        },
    ],
    benefit: [
        {
            key: 'automation',
            label: 'Automation',
            description: 'Business impact and justified savings from process automation.',
        },
        {
            key: 'augmentation',
            label: 'Augmentation',
            description: 'Productivity uplift from human-AI augmentation.',
        },
        {
            key: 'differentiation',
            label: 'Differentiation',
            description: 'Revenue and strategic upside from differentiated capabilities.',
        },
    ],
    mitigation: [
        {
            key: 'technical-risks',
            label: 'Technical risks',
            description: 'Risk mitigation actions and controls for technical delivery risks.',
        },
        {
            key: 'operational-risks',
            label: 'Operational risks',
            description: 'Risk mitigation actions for adoption and operational continuity.',
        },
        {
            key: 'strategic-risks',
            label: 'Strategic risks',
            description: 'Mitigations for strategic, regulatory, or reputational risk.',
        },
    ],
};

export interface BusinessCasePreviewInput {
    baselineAnnualCost: number;
    horizonYears: number;
    worksheet: BusinessCaseWorksheetInput;
}

export interface BusinessCaseProjectionRow extends WorksheetLineInput {
    yearlyValues: number[];
    total: number;
}

export interface BusinessCaseSectionProjection {
    id: WorksheetSectionId;
    label: string;
    rows: BusinessCaseProjectionRow[];
    yearlyTotals: number[];
    total: number;
}

export interface BusinessCasePreviewResult {
    horizonYears: number;
    yearLabels: string[];
    sections: BusinessCaseSectionProjection[];
    totalOneTimeCost: number;
    totalAnnualRunCost: number;
    annualSavings: number;
    netAnnualBenefit: number;
    totalCostOfOwnership: number;
    totalBenefit: number;
    netValue: number;
    netYearTotals: number[];
    runningNetTotals: number[];
    roiPercent: number | null;
    paybackMonths: number | null;
}

export interface InitiativeSummary {
    id: string;
    title: string;
    summary: string;
    owner: string;
    phase: string;
    templateSlug: string | null;
    updatedAt: string;
}

export interface BusinessCaseWorkspace {
    initiative: InitiativeSummary;
    assumptions: BusinessCasePreviewInput;
    preview: BusinessCasePreviewResult;
}

export interface DecisionMatrixOptionInput {
    optionName: string;
    costScore: number;
    benefitScore: number;
    riskScore: number;
    fitScore: number;
    rationale?: string;
}

export interface DecisionMatrixOption extends DecisionMatrixOptionInput {
    id: string;
    totalScore: number;
    recommendation: string;
}

export interface DecisionMatrixWorkspace {
    initiativeId: string;
    options: DecisionMatrixOption[];
    recommendedOptionId: string | null;
}

export interface RoadmapPhaseInput {
    title: string;
    lane: string;
    deliverables: string;
    startDate: string | null;
    endDate: string | null;
}

export interface RoadmapPhaseRecord extends RoadmapPhaseInput {
    id: string;
    phaseNumber: number;
    sortOrder: number;
}

export interface RoadmapWorkspace {
    initiativeId: string;
    phases: RoadmapPhaseRecord[];
}

export interface MarkdownExportDocument {
    fileName: string;
    content: string;
}

export interface AiDecisionStudioBridge {
    appName: string;
    appAuthor: string;
    version: string;
    listTemplates: () => Promise<TemplateSummary[]>;
    previewBusinessCase: (input: BusinessCasePreviewInput) => Promise<BusinessCasePreviewResult>;
    createInitiativeFromTemplate: (templateSlug: string) => Promise<BusinessCaseWorkspace>;
    listInitiatives: () => Promise<InitiativeSummary[]>;
    getInitiativeWorkspace: (initiativeId: string) => Promise<BusinessCaseWorkspace>;
    saveBusinessCase: (initiativeId: string, input: BusinessCasePreviewInput) => Promise<BusinessCaseWorkspace>;
    getDecisionMatrix: (initiativeId: string) => Promise<DecisionMatrixWorkspace>;
    saveDecisionMatrix: (initiativeId: string, options: DecisionMatrixOptionInput[]) => Promise<DecisionMatrixWorkspace>;
    getRoadmap: (initiativeId: string) => Promise<RoadmapWorkspace>;
    saveRoadmap: (initiativeId: string, phases: RoadmapPhaseInput[]) => Promise<RoadmapWorkspace>;
    exportInitiativeMarkdown: (initiativeId: string) => Promise<MarkdownExportDocument>;
}
