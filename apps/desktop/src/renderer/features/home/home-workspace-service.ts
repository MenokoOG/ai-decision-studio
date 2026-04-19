import type {
    BusinessCaseWorkspace,
    BusinessCasePreviewInput,
    BusinessCasePreviewResult,
    DecisionMatrixOptionInput,
    DecisionMatrixWorkspace,
    InitiativeSummary,
    RoadmapPhaseInput,
    RoadmapWorkspace,
    TemplateSummary,
} from '../../../shared/ipc';

function getBridge() {
    if (typeof window === 'undefined' || !window.aiDecisionStudio) {
        throw new Error('Desktop bridge unavailable. Open this screen in the Electron desktop app.');
    }

    return window.aiDecisionStudio;
}

export async function listTemplates() {
    return getBridge().listTemplates() as Promise<TemplateSummary[]>;
}

export async function previewBusinessCase(input: BusinessCasePreviewInput) {
    return getBridge().previewBusinessCase(input) as Promise<BusinessCasePreviewResult>;
}

export async function createInitiativeFromTemplate(templateSlug: string) {
    return getBridge().createInitiativeFromTemplate(templateSlug) as Promise<BusinessCaseWorkspace>;
}

export async function listInitiatives() {
    return getBridge().listInitiatives() as Promise<InitiativeSummary[]>;
}

export async function getInitiativeWorkspace(initiativeId: string) {
    return getBridge().getInitiativeWorkspace(initiativeId) as Promise<BusinessCaseWorkspace>;
}

export async function saveBusinessCase(initiativeId: string, input: BusinessCasePreviewInput) {
    return getBridge().saveBusinessCase(initiativeId, input) as Promise<BusinessCaseWorkspace>;
}

export async function getDecisionMatrix(initiativeId: string) {
    return getBridge().getDecisionMatrix(initiativeId) as Promise<DecisionMatrixWorkspace>;
}

export async function saveDecisionMatrix(initiativeId: string, options: DecisionMatrixOptionInput[]) {
    return getBridge().saveDecisionMatrix(initiativeId, options) as Promise<DecisionMatrixWorkspace>;
}

export async function getRoadmap(initiativeId: string) {
    return getBridge().getRoadmap(initiativeId) as Promise<RoadmapWorkspace>;
}

export async function saveRoadmap(initiativeId: string, phases: RoadmapPhaseInput[]) {
    return getBridge().saveRoadmap(initiativeId, phases) as Promise<RoadmapWorkspace>;
}
