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
    description: 'Compute, storage, networking, and environment footprint.',
  },
  {
    key: 'model-api-costs',
    label: 'Model and API costs',
    description: 'Token usage, model mix, fallback models, and vendor pricing assumptions.',
  },
  {
    key: 'data-engineering-pipelines',
    label: 'Data engineering pipelines',
    description: 'Data ingestion, transformation, vector indexing, and refresh cadence.',
  },
  {
    key: 'mlops-monitoring',
    label: 'MLOps and monitoring',
    description: 'Quality telemetry, drift, retraining triggers, and reliability observability.',
  },
  {
    key: 'talent-requirements',
    label: 'Talent requirements',
    description: 'Engineering and specialized AI roles required to build and operate.',
  },
  {
    key: 'integration-complexity',
    label: 'Integration complexity',
    description: 'Legacy systems, API dependencies, and migration complexity constraints.',
  },
  {
    key: 'security-compliance',
    label: 'Security and compliance',
    description: 'Data handling, governance controls, regulatory obligations, and audits.',
  },
  {
    key: 'reliability-risk',
    label: 'Reliability and risk',
    description: 'Failure modes, rollback plans, business continuity, and risk response.',
  },
  {
    key: 'product-ux-impact',
    label: 'Product and UX impact',
    description: 'User journey changes, friction points, and adoption implications.',
  },
  {
    key: 'financial-strategy',
    label: 'Financial strategy',
    description: 'Budget ownership, pricing model, ROI thresholds, and scale targets.',
  },
  {
    key: 'legal-ip',
    label: 'Legal and IP considerations',
    description: 'Licensing, terms, IP ownership, data rights, and contract implications.',
  },
  {
    key: 'change-management',
    label: 'Change management',
    description: 'Training, communication, process updates, and stakeholder adoption.',
  },
];

export type ReadinessState = {
  status: ReadinessStatus;
  notes: string;
};

export function createDefaultReadinessState(): Record<string, ReadinessState> {
  return Object.fromEntries(
    READINESS_ITEMS.map((item) => [
      item.key,
      {
        status: 'unknown' satisfies ReadinessStatus,
        notes: '',
      },
    ]),
  );
}
