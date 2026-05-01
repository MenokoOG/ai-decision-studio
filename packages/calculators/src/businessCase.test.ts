import assert from 'node:assert/strict';
import { test } from 'node:test';

import { evaluateBusinessCase, type BusinessCaseInput } from './businessCase';

function createInput(overrides?: Partial<BusinessCaseInput>): BusinessCaseInput {
  return {
    baselineAnnualCost: 220000,
    horizonYears: 5,
    worksheet: {
      costRows: [
        {
          key: 'engineering',
          label: 'Engineering',
          description: 'Build costs',
          oneTime: 120000,
          annual: 30000,
        },
      ],
      benefitRows: [
        {
          key: 'automation',
          label: 'Automation',
          description: 'Savings from automation',
          oneTime: 0,
          annual: 140000,
        },
      ],
      mitigationRows: [
        {
          key: 'technical-risks',
          label: 'Technical risks',
          description: 'Mitigation spend',
          oneTime: 10000,
          annual: 5000,
        },
      ],
    },
    ...overrides,
  };
}

test('projects one-time in year 1 and annual in years 2+', () => {
  const result = evaluateBusinessCase(createInput());

  assert.deepEqual(result.yearLabels, ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']);
  assert.equal(result.sections[0].rows[0].yearlyValues[0], 150000);
  assert.equal(result.sections[0].rows[0].yearlyValues[1], 30000);
  assert.equal(result.sections[1].rows[0].yearlyValues[0], 140000);
  assert.equal(result.sections[1].rows[0].yearlyValues[1], 140000);
});

test('computes deterministic totals and running net values', () => {
  const result = evaluateBusinessCase(createInput());

  assert.equal(result.totalOneTimeCost, 165000);
  assert.equal(result.totalAnnualRunCost, 35000);
  assert.equal(result.annualSavings, 140000);
  assert.equal(result.totalCostOfOwnership, 305000);
  assert.equal(result.totalBenefit, 700000);
  assert.equal(result.netValue, 395000);

  assert.deepEqual(result.netYearTotals, [-25000, 105000, 105000, 105000, 105000]);
  assert.deepEqual(result.runningNetTotals, [-25000, 80000, 185000, 290000, 395000]);
  assert.equal(result.roiPercent, 129.51);
  assert.equal(result.paybackMonths, 18.86);
});

test('keeps one-time values in year 1 only across all sections', () => {
  const result = evaluateBusinessCase(
    createInput({
      worksheet: {
        costRows: [
          {
            key: 'cost-test',
            label: 'Cost test',
            description: 'test',
            oneTime: 500,
            annual: 100,
          },
        ],
        benefitRows: [
          {
            key: 'benefit-test',
            label: 'Benefit test',
            description: 'test',
            oneTime: 700,
            annual: 200,
          },
        ],
        mitigationRows: [
          {
            key: 'mitigation-test',
            label: 'Mitigation test',
            description: 'test',
            oneTime: 300,
            annual: 50,
          },
        ],
      },
    }),
  );

  assert.equal(result.sections[0].yearlyTotals[0], 600);
  assert.equal(result.sections[0].yearlyTotals[1], 100);
  assert.equal(result.sections[1].yearlyTotals[0], 900);
  assert.equal(result.sections[1].yearlyTotals[1], 200);
  assert.equal(result.sections[2].yearlyTotals[0], 350);
  assert.equal(result.sections[2].yearlyTotals[1], 50);

  assert.deepEqual(result.netYearTotals, [-50, 50, 50, 50, 50]);
  assert.deepEqual(result.runningNetTotals, [-50, 0, 50, 100, 150]);
});

test('returns null ROI when total cost of ownership is zero', () => {
  const result = evaluateBusinessCase(
    createInput({
      worksheet: {
        costRows: [],
        benefitRows: [
          {
            key: 'benefit-only',
            label: 'Benefit only',
            description: 'test',
            oneTime: 0,
            annual: 100,
          },
        ],
        mitigationRows: [],
      },
    }),
  );

  assert.equal(result.totalCostOfOwnership, 0);
  assert.equal(result.roiPercent, null);
});

test('returns null payback when net annual benefit is not positive', () => {
  const result = evaluateBusinessCase(
    createInput({
      worksheet: {
        costRows: [
          {
            key: 'cost-heavy',
            label: 'Cost heavy',
            description: 'test',
            oneTime: 5000,
            annual: 2000,
          },
        ],
        benefitRows: [
          {
            key: 'benefit-light',
            label: 'Benefit light',
            description: 'test',
            oneTime: 0,
            annual: 500,
          },
        ],
        mitigationRows: [],
      },
    }),
  );

  assert.equal(result.netAnnualBenefit, -1500);
  assert.equal(result.paybackMonths, null);
});
