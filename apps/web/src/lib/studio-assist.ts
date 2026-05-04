import type { BusinessCasePreviewInput, WorksheetLineInput, WorksheetSectionId } from '@/lib/business-case';

export type ProviderMode = 'openai-compatible' | 'local-model';

export type ProviderSettings = {
    mode: ProviderMode;
    baseUrl: string;
    apiKey: string;
    model: string;
};

export const DEFAULT_PROVIDER_SETTINGS: ProviderSettings = {
    mode: 'openai-compatible',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4.1-mini',
};

export type ProviderValidation = {
    ok: boolean;
    message: string;
};

export function validateProviderSettings(input: ProviderSettings): ProviderValidation {
    if (!input.baseUrl.trim()) {
        return { ok: false, message: 'Base URL is required.' };
    }

    if (!input.model.trim()) {
        return { ok: false, message: 'Model is required.' };
    }

    if (input.mode === 'openai-compatible' && !input.apiKey.trim()) {
        return { ok: false, message: 'API key is required for cloud provider mode.' };
    }

    return { ok: true, message: 'Provider settings look valid.' };
}

export type CostSourceSuggestion = {
    id: string;
    title: string;
    sourceName: string;
    sourceUrl: string;
    section: WorksheetSectionId;
    rowKey: string;
    oneTime: number;
    annual: number;
    note: string;
};

export const COST_SOURCE_SUGGESTIONS: CostSourceSuggestion[] = [
    {
        id: 'bls-ml-engineer',
        title: 'ML engineer compensation benchmark',
        sourceName: 'U.S. Bureau of Labor Statistics',
        sourceUrl: 'https://www.bls.gov/ooh/computer-and-information-technology/computer-and-information-research-scientists.htm',
        section: 'cost',
        rowKey: 'engineering',
        oneTime: 0,
        annual: 185000,
        note: 'Use for 1 FTE blended annual cost baseline.',
    },
    {
        id: 'cloud-gpu-instance',
        title: 'GPU instance reference cost',
        sourceName: 'AWS EC2 pricing',
        sourceUrl: 'https://aws.amazon.com/ec2/pricing/on-demand/',
        section: 'cost',
        rowKey: 'infrastructure',
        oneTime: 12000,
        annual: 48000,
        note: 'Starter benchmark for model hosting + experimentation.',
    },
    {
        id: 'openai-api-pricing',
        title: 'API token pricing reference',
        sourceName: 'OpenAI Pricing',
        sourceUrl: 'https://openai.com/pricing',
        section: 'cost',
        rowKey: 'ai-api',
        oneTime: 0,
        annual: 36000,
        note: 'Estimate for sustained internal assistant usage.',
    },
    {
        id: 'change-management',
        title: 'Change enablement budget benchmark',
        sourceName: 'Prosci change management resources',
        sourceUrl: 'https://www.prosci.com/resources',
        section: 'cost',
        rowKey: 'operations-business',
        oneTime: 20000,
        annual: 15000,
        note: 'Training + adoption support for rollout teams.',
    },
    {
        id: 'automation-productivity',
        title: 'Knowledge worker productivity uplift',
        sourceName: 'McKinsey - The economic potential of generative AI',
        sourceUrl: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier',
        section: 'benefit',
        rowKey: 'automation',
        oneTime: 0,
        annual: 220000,
        note: 'Translate time savings to annualized labor value.',
    },
    {
        id: 'differentiation-revenue',
        title: 'AI feature premium revenue proxy',
        sourceName: 'Gartner AI value and product strategy research',
        sourceUrl: 'https://www.gartner.com/en/topics/artificial-intelligence',
        section: 'benefit',
        rowKey: 'differentiation',
        oneTime: 0,
        annual: 140000,
        note: 'Use as directional upside assumption before custom model.',
    },
    {
        id: 'security-risk-controls',
        title: 'AI governance and security controls',
        sourceName: 'NIST AI RMF',
        sourceUrl: 'https://www.nist.gov/itl/ai-risk-management-framework',
        section: 'mitigation',
        rowKey: 'strategic-risks',
        oneTime: 25000,
        annual: 10000,
        note: 'Budget for policy controls, audits, and risk governance.',
    },
];

function updateLine(line: WorksheetLineInput, suggestion: CostSourceSuggestion) {
    return {
        ...line,
        oneTime: Math.max(0, line.oneTime + suggestion.oneTime),
        annual: Math.max(0, line.annual + suggestion.annual),
    };
}

export function applySuggestionToInput(
    input: BusinessCasePreviewInput,
    suggestion: CostSourceSuggestion,
): BusinessCasePreviewInput {
    const worksheet = { ...input.worksheet };
    const key =
        suggestion.section === 'cost'
            ? 'costRows'
            : suggestion.section === 'benefit'
                ? 'benefitRows'
                : 'mitigationRows';

    worksheet[key] = worksheet[key].map((line) =>
        line.key === suggestion.rowKey ? updateLine(line, suggestion) : line,
    );

    return {
        ...input,
        worksheet,
    };
}
