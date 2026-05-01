export type WorksheetSectionId = 'cost' | 'benefit' | 'mitigation';

export type WorksheetLineInput = {
  key: string;
  label: string;
  description: string;
  oneTime: number;
  annual: number;
};

export type BusinessCasePreviewInput = {
  baselineAnnualCost: number;
  horizonYears: number;
  worksheet: {
    costRows: WorksheetLineInput[];
    benefitRows: WorksheetLineInput[];
    mitigationRows: WorksheetLineInput[];
  };
};

export const WORKSHEET_ROW_TEMPLATES: Record<WorksheetSectionId, Array<Omit<WorksheetLineInput, 'oneTime' | 'annual'>>> = {
  cost: [
    {
      key: 'data-acquisition',
      label: 'Data acquisition',
      description: 'Money for collecting and cleaning data so the AI can work reliably.',
    },
    {
      key: 'data-science-training',
      label: 'Data Science including training',
      description: 'Team time and tooling for experiments, model setup, and training.',
    },
    {
      key: 'engineering',
      label: 'Engineering',
      description: 'Developer work to build features and connect AI into your product.',
    },
    {
      key: 'infrastructure',
      label: 'Infrastructure',
      description: 'Cloud, storage, and platform services needed to run the solution.',
    },
    {
      key: 'ai-api',
      label: 'AI API',
      description: 'Pay-as-you-go model and API usage charges.',
    },
    {
      key: 'operations-business',
      label: 'Operations / business',
      description: 'Rollout, training, and process updates for day-to-day teams.',
    },
    {
      key: 'technical-support',
      label: 'Technical support',
      description: 'Bug fixes, monitoring, and maintenance after launch.',
    },
  ],
  benefit: [
    {
      key: 'automation',
      label: 'Automation',
      description: 'Money saved when repetitive work is handled automatically.',
    },
    {
      key: 'augmentation',
      label: 'Augmentation',
      description: 'Output gains when people work faster with AI assistance.',
    },
    {
      key: 'differentiation',
      label: 'Differentiation',
      description: 'New revenue or strategic upside from better customer experiences.',
    },
  ],
  mitigation: [
    {
      key: 'technical-risks',
      label: 'Technical risks',
      description: 'Money spent to reduce outages, quality issues, or integration failures.',
    },
    {
      key: 'operational-risks',
      label: 'Operational risks',
      description: 'Money spent to reduce rollout, adoption, and support risks.',
    },
    {
      key: 'strategic-risks',
      label: 'Strategic risks',
      description: 'Money spent on compliance, governance, and reputation protection.',
    },
  ],
};

function createRows(section: WorksheetSectionId): WorksheetLineInput[] {
  return WORKSHEET_ROW_TEMPLATES[section].map((line) => ({ ...line, oneTime: 0, annual: 0 }));
}

export function createDefaultBusinessCaseInput(): BusinessCasePreviewInput {
  const worksheet = {
    costRows: createRows('cost'),
    benefitRows: createRows('benefit'),
    mitigationRows: createRows('mitigation'),
  };

  worksheet.costRows[2].oneTime = 120000;
  worksheet.costRows[2].annual = 30000;
  worksheet.benefitRows[0].annual = 140000;

  return {
    baselineAnnualCost: 220000,
    horizonYears: 5,
    worksheet,
  };
}
