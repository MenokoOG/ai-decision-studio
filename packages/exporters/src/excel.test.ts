import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import ExcelJS from 'exceljs';

import { buildInitiativeExcelExport } from './excel.js';
import type { InitiativeExportInput } from './types.js';

const fixture: InitiativeExportInput = {
    initiative: {
        id: 'init_1',
        title: 'Customer Support AI',
        summary: 'Deflect tickets while preserving SLA',
        owner: 'jeff',
        phase: 'PILOT',
        updatedAt: '2026-04-30T10:00:00.000Z',
    },
    assumptions: {
        baselineAnnualCost: 250000,
        horizonYears: 3,
        worksheet: {
            costRows: [
                {
                    key: 'engineering',
                    label: 'Engineering',
                    description: 'Build and integrate the assistant',
                    oneTime: 80000,
                    annual: 12000,
                },
                {
                    key: 'ai-api',
                    label: 'AI API',
                    description: 'Token usage charges',
                    oneTime: 0,
                    annual: 36000,
                },
            ],
            benefitRows: [
                {
                    key: 'automation',
                    label: 'Automation',
                    description: 'Tickets deflected',
                    oneTime: 0,
                    annual: 120000,
                },
            ],
            mitigationRows: [],
        },
    },
    preview: {
        totalCostOfOwnership: 188000,
        totalBenefit: 360000,
        netValue: 172000,
        netAnnualBenefit: 84000,
        roiPercent: 91.5,
        paybackMonths: 11.4,
    },
    decisionMatrix: {
        options: [
            {
                optionName: 'Build with OpenAI',
                costScore: 3,
                benefitScore: 5,
                riskScore: 3,
                fitScore: 4,
                totalScore: 3.75,
                recommendation: 'Recommended',
                rationale: 'Best benefit/risk balance',
            },
        ],
    },
    roadmap: {
        phases: [
            {
                phaseNumber: 1,
                title: 'Pilot launch',
                lane: 'Delivery',
                deliverables: 'Internal pilot with 50 agents',
                startDate: '2026-05-01',
                endDate: '2026-07-31',
            },
        ],
    },
    readiness: {
        confidenceScore: 78.0,
        items: [
            { key: 'infra', label: 'Infrastructure', status: 'ready' },
            { key: 'data', label: 'Data pipelines', status: 'draft', notes: 'Need backfill' },
        ],
    },
    exportedAt: '2026-05-03T19:00:00.000Z',
};

test('buildInitiativeExcelExport returns a valid xlsx with all expected sheets', async () => {
    const result = await buildInitiativeExcelExport(fixture);
    assert.equal(result.fileName, 'customer-support-ai-2026-05-03.xlsx');
    assert.ok(result.buffer.byteLength > 1000, 'buffer should be non-trivial size');

    // Persist for manual inspection during the run
    const dir = mkdtempSync(join(tmpdir(), 'excel-export-'));
    const path = join(dir, result.fileName);
    writeFileSync(path, result.buffer);
    console.log(`wrote sample to ${path} (${result.buffer.byteLength} bytes)`);

    // Round-trip parse to confirm the file is structurally valid Excel
    const loaded = new ExcelJS.Workbook();
    await loaded.xlsx.load(result.buffer);
    const sheetNames = loaded.worksheets.map((sheet) => sheet.name).sort();
    assert.deepEqual(sheetNames, [
        'Benefits',
        'Business Case',
        'Costs',
        'Decision Matrix',
        'Initiative',
        'Outputs',
        'Readiness',
        'Risk Mitigations',
        'Roadmap',
    ]);

    const initiative = loaded.getWorksheet('Initiative');
    assert.ok(initiative, 'Initiative sheet should exist');
    assert.equal(initiative.getCell('B2').value, 'Customer Support AI');

    const costs = loaded.getWorksheet('Costs');
    assert.ok(costs, 'Costs sheet should exist');
    // header row + 2 data rows + total row
    assert.equal(costs.rowCount, 4);
    assert.equal(costs.getCell('A4').value, 'Total');
    assert.equal(costs.getCell('C4').value, 80000);
    assert.equal(costs.getCell('D4').value, 48000);

    const outputs = loaded.getWorksheet('Outputs');
    assert.ok(outputs, 'Outputs sheet should exist');
    assert.equal(outputs.getCell('B2').value, 188000);
    assert.equal(outputs.getCell('B6').value, 91.5);

    const readiness = loaded.getWorksheet('Readiness');
    assert.ok(readiness, 'Readiness sheet should exist');
    assert.equal(readiness.getCell('B1').value, 78.0);
});

test('buildInitiativeExcelExport handles empty workspaces gracefully', async () => {
    const result = await buildInitiativeExcelExport({
        ...fixture,
        assumptions: {
            ...fixture.assumptions,
            worksheet: { costRows: [], benefitRows: [], mitigationRows: [] },
        },
        decisionMatrix: { options: [] },
        roadmap: { phases: [] },
        readiness: { confidenceScore: null, items: [] },
    });

    const loaded = new ExcelJS.Workbook();
    await loaded.xlsx.load(result.buffer);
    assert.equal(loaded.getWorksheet('Costs')?.getCell('A2').value, 'No rows');
    assert.equal(
        loaded.getWorksheet('Decision Matrix')?.getCell('A2').value,
        'No decision options saved yet',
    );
    assert.equal(loaded.getWorksheet('Roadmap')?.getCell('A2').value, 'No roadmap phases saved yet');
    assert.equal(loaded.getWorksheet('Readiness')?.getCell('B1').value, 'n/a');
});
