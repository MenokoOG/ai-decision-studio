type InitiativeSummary = {
    id: string;
    title: string;
    summary: string;
    owner: string;
    phase: string;
    updatedAt: string;
};

type BusinessCaseAssumptions = {
    baselineAnnualCost: number;
    horizonYears: number;
    worksheet: {
        costRows: BusinessCaseWorksheetLine[];
        benefitRows: BusinessCaseWorksheetLine[];
        mitigationRows: BusinessCaseWorksheetLine[];
    };
};

type BusinessCaseWorksheetLine = {
    key: string;
    label: string;
    description: string;
    oneTime: number;
    annual: number;
};

type BusinessCasePreview = {
    totalCostOfOwnership: number;
    totalBenefit: number;
    netValue: number;
    netAnnualBenefit: number;
    roiPercent: number | null;
    paybackMonths: number | null;
};

type DecisionMatrixOption = {
    optionName: string;
    costScore: number;
    benefitScore: number;
    riskScore: number;
    fitScore: number;
    totalScore: number;
    recommendation: string;
    rationale?: string;
};

type DecisionMatrixWorkspace = {
    options: DecisionMatrixOption[];
};

type RoadmapPhase = {
    phaseNumber: number;
    title: string;
    lane: string;
    deliverables: string;
    startDate: string | null;
    endDate: string | null;
};

type RoadmapWorkspace = {
    phases: RoadmapPhase[];
};

export interface MarkdownExportInput {
    initiative: InitiativeSummary;
    assumptions: BusinessCaseAssumptions;
    preview: BusinessCasePreview;
    decisionMatrix: DecisionMatrixWorkspace;
    roadmap: RoadmapWorkspace;
    exportedAt?: string;
}

export interface MarkdownExportDocument {
    fileName: string;
    content: string;
}

function asCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value);
}

function asPercent(value: number | null) {
    if (value === null) {
        return 'n/a';
    }

    return `${value.toFixed(1)}%`;
}

function asMonths(value: number | null) {
    if (value === null) {
        return 'n/a';
    }

    return `${value.toFixed(1)} months`;
}

function asDate(value: string | null) {
    if (!value) {
        return '-';
    }

    return value.slice(0, 10);
}

function sanitizeFileSegment(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

function escapeCell(value: string) {
    return value.replace(/\|/g, '\\|').replace(/\n/g, '<br/>');
}

function buildWorksheetRows(rows: BusinessCaseWorksheetLine[]) {
    if (rows.length === 0) {
        return '| _No rows_ | - | - | - |';
    }

    return rows
        .map(
            (row) =>
                `| ${escapeCell(row.label)} | ${escapeCell(row.description)} | ${asCurrency(row.oneTime)} | ${asCurrency(row.annual)} |`,
        )
        .join('\n');
}

export function buildInitiativeMarkdownExport(input: MarkdownExportInput): MarkdownExportDocument {
    const exportedAt = input.exportedAt ?? new Date().toISOString();
    const exportedDate = exportedAt.slice(0, 10);
    const initiativeSlug = sanitizeFileSegment(input.initiative.title) || 'initiative';
    const fileName = `${initiativeSlug}-${exportedDate}.md`;

    const decisionRows =
        input.decisionMatrix.options.length > 0
            ? input.decisionMatrix.options
                .map(
                    (option) =>
                        `| ${escapeCell(option.optionName)} | ${option.costScore} | ${option.benefitScore} | ${option.riskScore} | ${option.fitScore} | ${option.totalScore.toFixed(2)} | ${escapeCell(option.recommendation)} | ${escapeCell(option.rationale ?? '')} |`,
                )
                .join('\n')
            : '| _No decision options saved yet_ | - | - | - | - | - | - | - |';

    const roadmapRows =
        input.roadmap.phases.length > 0
            ? input.roadmap.phases
                .map(
                    (phase) =>
                        `| ${phase.phaseNumber} | ${escapeCell(phase.title)} | ${escapeCell(phase.lane)} | ${asDate(phase.startDate)} | ${asDate(phase.endDate)} | ${escapeCell(phase.deliverables)} |`,
                )
                .join('\n')
            : '| _No roadmap phases saved yet_ | - | - | - | - | - |';

    const markdown = `# AI Decision Studio Export

## Initiative

- Title: ${input.initiative.title}
- Summary: ${input.initiative.summary}
- Owner: ${input.initiative.owner}
- Phase: ${input.initiative.phase}
- Last Updated: ${input.initiative.updatedAt.slice(0, 10)}
- Exported At: ${exportedAt}

## Business Case Assumptions

| Field | Value |
| --- | ---: |
| Baseline Annual Cost | ${asCurrency(input.assumptions.baselineAnnualCost)} |
| Horizon Years | ${input.assumptions.horizonYears} |

### Cost Rows

| Line Item | Description | One-Time | Annual |
| --- | --- | ---: | ---: |
${buildWorksheetRows(input.assumptions.worksheet.costRows)}

### Benefit Rows

| Line Item | Description | One-Time | Annual |
| --- | --- | ---: | ---: |
${buildWorksheetRows(input.assumptions.worksheet.benefitRows)}

### Risk Mitigation Rows

| Line Item | Description | One-Time | Annual |
| --- | --- | ---: | ---: |
${buildWorksheetRows(input.assumptions.worksheet.mitigationRows)}

## Deterministic Outputs

| Metric | Value |
| --- | ---: |
| Total Cost of Ownership | ${asCurrency(input.preview.totalCostOfOwnership)} |
| Total Benefit | ${asCurrency(input.preview.totalBenefit)} |
| Net Value | ${asCurrency(input.preview.netValue)} |
| Net Annual Benefit | ${asCurrency(input.preview.netAnnualBenefit)} |
| ROI | ${asPercent(input.preview.roiPercent)} |
| Payback | ${asMonths(input.preview.paybackMonths)} |

## Decision Matrix

| Option | Cost | Benefit | Risk | Fit | Score | Recommendation | Rationale |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
${decisionRows}

## Roadmap

| Phase | Title | Lane | Start | End | Deliverables |
| ---: | --- | --- | --- | --- | --- |
${roadmapRows}
`;

    return {
        fileName,
        content: markdown,
    };
}