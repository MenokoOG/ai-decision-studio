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

export interface BusinessCasePreviewInput {
    baselineAnnualCost: number;
    expectedAnnualCostReduction: number;
    implementationOneTimeCost: number;
    implementationAnnualCost: number;
    horizonYears: number;
}

export interface BusinessCasePreviewResult {
    horizonYears: number;
    totalOneTimeCost: number;
    totalAnnualRunCost: number;
    annualSavings: number;
    netAnnualBenefit: number;
    totalCostOfOwnership: number;
    totalBenefit: number;
    netValue: number;
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
}
