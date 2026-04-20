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
});
