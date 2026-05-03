import {
    type BusinessCaseWorksheetLine,
    type InitiativeExportInput,
    type ReadinessItem,
    readinessStatusLabel,
    sanitizeFileSegment,
} from './types.js';

export type MarkdownExportInput = InitiativeExportInput;

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

function escapeCell(value: string) {
    return value.replace(/\|/g, '\\|').replace(/\n/g, '<br/>');
}

function asReadinessStatus(value: ReadinessItem['status']) {
    return readinessStatusLabel(value);
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

    const readinessRows =
        input.readiness && input.readiness.items.length > 0
            ? input.readiness.items
                .map(
                    (item) =>
                        `| ${escapeCell(item.label)} | ${asReadinessStatus(item.status)} | ${escapeCell(item.notes ?? '')} |`,
                )
                .join('\n')
            : '| _No readiness checklist saved yet_ | - | - |';

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

## Readiness

| Metric | Value |
| --- | ---: |
| Confidence Score | ${asPercent(input.readiness?.confidenceScore ?? null)} |

| Category | Status | Notes |
| --- | --- | --- |
${readinessRows}
`;

    return {
        fileName,
        content: markdown,
    };
}