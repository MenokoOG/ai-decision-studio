export interface InitiativeSummary {
    id: string;
    title: string;
    summary: string;
    owner: string;
    phase: string;
    updatedAt: string;
}

export interface BusinessCaseWorksheetLine {
    key: string;
    label: string;
    description: string;
    oneTime: number;
    annual: number;
}

export interface BusinessCaseAssumptions {
    baselineAnnualCost: number;
    horizonYears: number;
    worksheet: {
        costRows: BusinessCaseWorksheetLine[];
        benefitRows: BusinessCaseWorksheetLine[];
        mitigationRows: BusinessCaseWorksheetLine[];
    };
}

export interface BusinessCasePreview {
    totalCostOfOwnership: number;
    totalBenefit: number;
    netValue: number;
    netAnnualBenefit: number;
    roiPercent: number | null;
    paybackMonths: number | null;
}

export interface DecisionMatrixOption {
    optionName: string;
    costScore: number;
    benefitScore: number;
    riskScore: number;
    fitScore: number;
    totalScore: number;
    recommendation: string;
    rationale?: string;
}

export interface DecisionMatrixWorkspace {
    options: DecisionMatrixOption[];
}

export interface RoadmapPhase {
    phaseNumber: number;
    title: string;
    lane: string;
    deliverables: string;
    startDate: string | null;
    endDate: string | null;
}

export interface RoadmapWorkspace {
    phases: RoadmapPhase[];
}

export type ReadinessStatus = 'unknown' | 'draft' | 'ready';

export interface ReadinessItem {
    key: string;
    label: string;
    status: ReadinessStatus;
    notes?: string;
}

export interface ReadinessWorkspace {
    confidenceScore: number | null;
    items: ReadinessItem[];
}

export interface InitiativeExportInput {
    initiative: InitiativeSummary;
    assumptions: BusinessCaseAssumptions;
    preview: BusinessCasePreview;
    decisionMatrix: DecisionMatrixWorkspace;
    roadmap: RoadmapWorkspace;
    readiness?: ReadinessWorkspace;
    exportedAt?: string;
}

export function sanitizeFileSegment(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

export function readinessStatusLabel(value: ReadinessStatus): string {
    if (value === 'ready') return 'Ready';
    if (value === 'draft') return 'Draft';
    return 'Unknown';
}
