export interface LineItem {
  oneTime: number;
  annual: number;
}

export interface BusinessCaseInput {
  baselineAnnualCost: number;
  expectedAnnualCostReduction: number;
  implementationCosts: LineItem[];
  horizonYears: number;
}

export interface BusinessCaseSummary {
  horizonYears: number;
  totalOneTimeCost: number;
  totalAnnualRunCost: number;
  annualSavings: number;
  netAnnualBenefit: number;
  totalCostOfOwnership: number;
  totalBenefit: number;
  netValue: number;
  roiPercent: number | null;
  paybackMonths: number | null;
}

function normalizeCurrency(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}

function normalizeHorizon(years: number) {
  if (!Number.isFinite(years)) {
    return 1;
  }

  return Math.max(1, Math.trunc(years));
}

export function sumLines(lines: LineItem[]) {
  return lines.reduce(
    (acc, line) => {
      acc.oneTime += line.oneTime;
      acc.annual += line.annual;
      return acc;
    },
    { oneTime: 0, annual: 0 },
  );
}

export function fiveYearTotal(lines: LineItem[]) {
  const totals = sumLines(lines);
  return totals.oneTime + totals.annual * 5;
}

export function evaluateBusinessCase(input: BusinessCaseInput): BusinessCaseSummary {
  const horizonYears = normalizeHorizon(input.horizonYears);
  const totals = sumLines(input.implementationCosts);

  const totalOneTimeCost = normalizeCurrency(totals.oneTime);
  const totalAnnualRunCost = normalizeCurrency(totals.annual);
  const annualSavings = normalizeCurrency(
    Math.min(input.baselineAnnualCost, input.expectedAnnualCostReduction),
  );
  const netAnnualBenefit = normalizeCurrency(annualSavings - totalAnnualRunCost);

  const totalCostOfOwnership = normalizeCurrency(totalOneTimeCost + totalAnnualRunCost * horizonYears);
  const totalBenefit = normalizeCurrency(annualSavings * horizonYears);
  const netValue = normalizeCurrency(totalBenefit - totalCostOfOwnership);

  const roiPercent =
    totalCostOfOwnership > 0 ? normalizeCurrency((netValue / totalCostOfOwnership) * 100) : null;

  const paybackMonths =
    netAnnualBenefit > 0 ? normalizeCurrency((totalOneTimeCost / netAnnualBenefit) * 12) : null;

  return {
    horizonYears,
    totalOneTimeCost,
    totalAnnualRunCost,
    annualSavings,
    netAnnualBenefit,
    totalCostOfOwnership,
    totalBenefit,
    netValue,
    roiPercent,
    paybackMonths,
  };
}
