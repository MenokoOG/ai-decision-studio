import ExcelJS from 'exceljs';

import {
    type BusinessCaseWorksheetLine,
    type InitiativeExportInput,
    readinessStatusLabel,
    sanitizeFileSegment,
} from './types.js';

export type ExcelExportInput = InitiativeExportInput;

export interface ExcelExportDocument {
    fileName: string;
    buffer: Uint8Array;
}

const CURRENCY_FMT = '"$"#,##0;[Red]-"$"#,##0';
const PERCENT_DECIMAL_FMT = '0.0"%";[Red]-0.0"%"';
const MONTHS_FMT = '0.0" months"';
const HEADER_FILL: ExcelJS.FillPattern = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF132A57' },
};

function styleHeaderRow(row: ExcelJS.Row) {
    row.font = { bold: true, color: { argb: 'FFE6F1FF' } };
    row.fill = HEADER_FILL;
    row.alignment = { vertical: 'middle', horizontal: 'left' };
}

function setColumnWidths(sheet: ExcelJS.Worksheet, widths: number[]) {
    widths.forEach((width, index) => {
        sheet.getColumn(index + 1).width = width;
    });
}

function addInitiativeSheet(workbook: ExcelJS.Workbook, input: InitiativeExportInput, exportedAt: string) {
    const sheet = workbook.addWorksheet('Initiative');
    setColumnWidths(sheet, [22, 80]);
    sheet.addRows([
        ['Field', 'Value'],
        ['Title', input.initiative.title],
        ['Summary', input.initiative.summary],
        ['Owner', input.initiative.owner],
        ['Phase', input.initiative.phase],
        ['Last Updated', input.initiative.updatedAt.slice(0, 10)],
        ['Initiative ID', input.initiative.id],
        ['Exported At', exportedAt],
    ]);
    styleHeaderRow(sheet.getRow(1));
}

function addAssumptionsSheet(workbook: ExcelJS.Workbook, input: InitiativeExportInput) {
    const sheet = workbook.addWorksheet('Business Case');
    setColumnWidths(sheet, [28, 18]);
    sheet.addRows([
        ['Field', 'Value'],
        ['Baseline Annual Cost', input.assumptions.baselineAnnualCost],
        ['Horizon Years', input.assumptions.horizonYears],
    ]);
    styleHeaderRow(sheet.getRow(1));
    sheet.getCell('B2').numFmt = CURRENCY_FMT;
}

function addWorksheetSheet(
    workbook: ExcelJS.Workbook,
    sheetName: string,
    rows: BusinessCaseWorksheetLine[],
) {
    const sheet = workbook.addWorksheet(sheetName);
    setColumnWidths(sheet, [28, 60, 16, 16, 16]);
    sheet.addRow(['Line Item', 'Description', 'One-Time', 'Annual', 'Total Year 1']);
    styleHeaderRow(sheet.getRow(1));

    if (rows.length === 0) {
        sheet.addRow(['No rows', '', '', '', '']);
        sheet.getRow(2).font = { italic: true, color: { argb: 'FF888888' } };
        return;
    }

    rows.forEach((row) => {
        const dataRow = sheet.addRow([
            row.label,
            row.description,
            row.oneTime,
            row.annual,
            row.oneTime + row.annual,
        ]);
        dataRow.getCell(3).numFmt = CURRENCY_FMT;
        dataRow.getCell(4).numFmt = CURRENCY_FMT;
        dataRow.getCell(5).numFmt = CURRENCY_FMT;
    });

    const totalRow = sheet.addRow([
        'Total',
        '',
        rows.reduce((sum, row) => sum + row.oneTime, 0),
        rows.reduce((sum, row) => sum + row.annual, 0),
        rows.reduce((sum, row) => sum + row.oneTime + row.annual, 0),
    ]);
    totalRow.font = { bold: true };
    totalRow.getCell(3).numFmt = CURRENCY_FMT;
    totalRow.getCell(4).numFmt = CURRENCY_FMT;
    totalRow.getCell(5).numFmt = CURRENCY_FMT;
}

function addOutputsSheet(workbook: ExcelJS.Workbook, input: InitiativeExportInput) {
    const sheet = workbook.addWorksheet('Outputs');
    setColumnWidths(sheet, [28, 18]);
    sheet.addRow(['Metric', 'Value']);
    styleHeaderRow(sheet.getRow(1));

    const rows: Array<[string, number | null, string]> = [
        ['Total Cost of Ownership', input.preview.totalCostOfOwnership, CURRENCY_FMT],
        ['Total Benefit', input.preview.totalBenefit, CURRENCY_FMT],
        ['Net Value', input.preview.netValue, CURRENCY_FMT],
        ['Net Annual Benefit', input.preview.netAnnualBenefit, CURRENCY_FMT],
        ['ROI', input.preview.roiPercent, PERCENT_DECIMAL_FMT],
        ['Payback', input.preview.paybackMonths, MONTHS_FMT],
    ];

    rows.forEach(([label, value, fmt]) => {
        const row = sheet.addRow([label, value ?? 'n/a']);
        if (value !== null && value !== undefined) {
            row.getCell(2).numFmt = fmt;
        }
    });
}

function addDecisionMatrixSheet(workbook: ExcelJS.Workbook, input: InitiativeExportInput) {
    const sheet = workbook.addWorksheet('Decision Matrix');
    setColumnWidths(sheet, [28, 8, 10, 8, 8, 10, 22, 50]);
    sheet.addRow([
        'Option',
        'Cost',
        'Benefit',
        'Risk',
        'Fit',
        'Score',
        'Recommendation',
        'Rationale',
    ]);
    styleHeaderRow(sheet.getRow(1));

    if (input.decisionMatrix.options.length === 0) {
        const row = sheet.addRow(['No decision options saved yet', '', '', '', '', '', '', '']);
        row.font = { italic: true, color: { argb: 'FF888888' } };
        return;
    }

    input.decisionMatrix.options.forEach((option) => {
        const row = sheet.addRow([
            option.optionName,
            option.costScore,
            option.benefitScore,
            option.riskScore,
            option.fitScore,
            Number(option.totalScore.toFixed(2)),
            option.recommendation,
            option.rationale ?? '',
        ]);
        row.getCell(6).numFmt = '0.00';
    });
}

function addRoadmapSheet(workbook: ExcelJS.Workbook, input: InitiativeExportInput) {
    const sheet = workbook.addWorksheet('Roadmap');
    setColumnWidths(sheet, [8, 28, 18, 14, 14, 60]);
    sheet.addRow(['Phase', 'Title', 'Lane', 'Start', 'End', 'Deliverables']);
    styleHeaderRow(sheet.getRow(1));

    if (input.roadmap.phases.length === 0) {
        const row = sheet.addRow(['No roadmap phases saved yet', '', '', '', '', '']);
        row.font = { italic: true, color: { argb: 'FF888888' } };
        return;
    }

    input.roadmap.phases.forEach((phase) => {
        sheet.addRow([
            phase.phaseNumber,
            phase.title,
            phase.lane,
            phase.startDate ? phase.startDate.slice(0, 10) : '',
            phase.endDate ? phase.endDate.slice(0, 10) : '',
            phase.deliverables,
        ]);
    });
}

function addReadinessSheet(workbook: ExcelJS.Workbook, input: InitiativeExportInput) {
    const sheet = workbook.addWorksheet('Readiness');
    setColumnWidths(sheet, [28, 14, 60]);
    sheet.addRow(['Confidence Score', input.readiness?.confidenceScore ?? 'n/a']);
    if (input.readiness?.confidenceScore !== null && input.readiness?.confidenceScore !== undefined) {
        sheet.getCell('B1').numFmt = PERCENT_DECIMAL_FMT;
    }
    sheet.getRow(1).font = { bold: true };

    sheet.addRow([]);
    sheet.addRow(['Category', 'Status', 'Notes']);
    styleHeaderRow(sheet.getRow(3));

    const items = input.readiness?.items ?? [];
    if (items.length === 0) {
        const row = sheet.addRow(['No readiness checklist saved yet', '', '']);
        row.font = { italic: true, color: { argb: 'FF888888' } };
        return;
    }

    items.forEach((item) => {
        sheet.addRow([item.label, readinessStatusLabel(item.status), item.notes ?? '']);
    });
}

export async function buildInitiativeExcelExport(
    input: InitiativeExportInput,
): Promise<ExcelExportDocument> {
    const exportedAt = input.exportedAt ?? new Date().toISOString();
    const exportedDate = exportedAt.slice(0, 10);
    const initiativeSlug = sanitizeFileSegment(input.initiative.title) || 'initiative';
    const fileName = `${initiativeSlug}-${exportedDate}.xlsx`;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AI Decision Studio';
    workbook.lastModifiedBy = 'AI Decision Studio';
    workbook.created = new Date(exportedAt);
    workbook.modified = new Date(exportedAt);

    addInitiativeSheet(workbook, input, exportedAt);
    addAssumptionsSheet(workbook, input);
    addWorksheetSheet(workbook, 'Costs', input.assumptions.worksheet.costRows);
    addWorksheetSheet(workbook, 'Benefits', input.assumptions.worksheet.benefitRows);
    addWorksheetSheet(workbook, 'Risk Mitigations', input.assumptions.worksheet.mitigationRows);
    addOutputsSheet(workbook, input);
    addDecisionMatrixSheet(workbook, input);
    addRoadmapSheet(workbook, input);
    addReadinessSheet(workbook, input);

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    const buffer = new Uint8Array(arrayBuffer as ArrayBuffer);
    return { fileName, buffer };
}
