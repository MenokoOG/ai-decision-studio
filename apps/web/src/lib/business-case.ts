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
