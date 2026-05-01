export type ReadinessStatus = 'unknown' | 'draft' | 'ready';

export type ReadinessItem = {
  key: string;
  label: string;
  description: string;
};

export const READINESS_ITEMS: ReadinessItem[] = [
  {
    key: 'infrastructure-compute',
    label: 'Infrastructure and compute',
    description: 'Do we have enough cloud capacity, storage, and environments to run this safely?',
  },
  {
    key: 'model-api-costs',
    label: 'Model and API costs',
    description: 'Do we understand token usage, model pricing, and fallback cost scenarios?',
  },
  {
    key: 'data-engineering-pipelines',
    label: 'Data engineering pipelines',
    description: 'Can data be collected, cleaned, and refreshed on a reliable schedule?',
  },
  {
    key: 'mlops-monitoring',
    label: 'MLOps and monitoring',
    description: 'Can we monitor quality and catch drift before users are affected?',
  },
  {
    key: 'talent-requirements',
    label: 'Talent requirements',
    description: 'Do we have the right people and enough time to build and run this?',
  },
  {
    key: 'integration-complexity',
    label: 'Integration complexity',
    description: 'How hard is it to connect this with current systems and data sources?',
  },
  {
    key: 'security-compliance',
    label: 'Security and compliance',
    description: 'Are privacy, governance, and compliance controls clearly defined?',
  },
  {
    key: 'reliability-risk',
    label: 'Reliability and risk',
    description: 'Do we have rollback plans and response steps if something fails?',
  },
  {
    key: 'product-ux-impact',
    label: 'Product and UX impact',
    description: 'Will this improve user experience without adding confusion or friction?',
  },
  {
    key: 'financial-strategy',
    label: 'Financial strategy',
    description: 'Is budget ownership clear, and do we agree on ROI and scale goals?',
  },
  {
    key: 'legal-ip',
    label: 'Legal and IP considerations',
    description: 'Are licensing, data rights, and IP responsibilities fully understood?',
  },
  {
    key: 'change-management',
    label: 'Change management',
    description: 'Are training, communications, and team adoption plans ready?',
  },
];

export type ReadinessState = {
  status: ReadinessStatus;
};

export function createDefaultReadinessState(): Record<string, ReadinessState> {
  return Object.fromEntries(
    READINESS_ITEMS.map((item) => [
      item.key,
      {
        status: 'unknown' satisfies ReadinessStatus,
      },
    ]),
  );
}
