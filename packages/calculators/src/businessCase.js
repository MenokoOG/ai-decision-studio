function normalizeCurrency(value) {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return Math.round(value * 100) / 100;
}
function normalizeHorizon(years) {
    if (!Number.isFinite(years)) {
        return 5;
    }
    return Math.max(1, Math.min(10, Math.trunc(years)));
}
export function sumLines(lines) {
    return lines.reduce((acc, line) => {
        acc.oneTime += line.oneTime;
        acc.annual += line.annual;
        return acc;
    }, { oneTime: 0, annual: 0 });
}
export function fiveYearTotal(lines) {
    const totals = sumLines(lines);
    return totals.oneTime + totals.annual * 5;
}
function projectRow(line, horizonYears) {
    const yearlyValues = Array.from({ length: horizonYears }, (_unused, index) => {
        if (index === 0) {
            return normalizeCurrency(line.oneTime);
        }
        return normalizeCurrency(line.annual);
    });
    return {
        key: line.key,
        label: line.label,
        description: line.description,
        oneTime: normalizeCurrency(line.oneTime),
        annual: normalizeCurrency(line.annual),
        yearlyValues,
        total: normalizeCurrency(yearlyValues.reduce((sum, value) => sum + value, 0)),
    };
}
function projectSection(id, label, rows, horizonYears) {
    const projectedRows = rows.map((row) => projectRow(row, horizonYears));
    const yearlyTotals = Array.from({ length: horizonYears }, (_unused, yearIndex) => normalizeCurrency(projectedRows.reduce((sum, row) => sum + (row.yearlyValues[yearIndex] ?? 0), 0)));
    return {
        id,
        label,
        rows: projectedRows,
        yearlyTotals,
        total: normalizeCurrency(yearlyTotals.reduce((sum, value) => sum + value, 0)),
    };
}
export function evaluateBusinessCase(input) {
    const horizonYears = normalizeHorizon(input.horizonYears);
    const costSection = projectSection('cost', 'Costs', input.worksheet.costRows, horizonYears);
    const benefitSection = projectSection('benefit', 'Benefits', input.worksheet.benefitRows, horizonYears);
    const mitigationSection = projectSection('mitigation', 'Risk Mitigations', input.worksheet.mitigationRows, horizonYears);
    const sections = [costSection, benefitSection, mitigationSection];
    const totalOneTimeCost = normalizeCurrency(costSection.yearlyTotals[0] + mitigationSection.yearlyTotals[0]);
    const totalAnnualRunCost = normalizeCurrency(sumLines([...input.worksheet.costRows, ...input.worksheet.mitigationRows]).annual);
    const annualSavings = normalizeCurrency(sumLines(input.worksheet.benefitRows).annual);
    const totalCostOfOwnership = normalizeCurrency(costSection.total + mitigationSection.total);
    const totalBenefit = normalizeCurrency(benefitSection.total);
    const netValue = normalizeCurrency(totalBenefit - totalCostOfOwnership);
    const netAnnualBenefit = normalizeCurrency(annualSavings - totalAnnualRunCost);
    const netYearTotals = Array.from({ length: horizonYears }, (_unused, index) => normalizeCurrency((benefitSection.yearlyTotals[index] ?? 0) -
        (costSection.yearlyTotals[index] ?? 0) -
        (mitigationSection.yearlyTotals[index] ?? 0)));
    const runningNetTotals = [];
    for (const yearlyNet of netYearTotals) {
        const previous = runningNetTotals[runningNetTotals.length - 1] ?? 0;
        runningNetTotals.push(normalizeCurrency(previous + yearlyNet));
    }
    const yearLabels = Array.from({ length: horizonYears }, (_unused, index) => `Year ${index + 1}`);
    const roiPercent = totalCostOfOwnership > 0 ? normalizeCurrency((netValue / totalCostOfOwnership) * 100) : null;
    const paybackMonths = netAnnualBenefit > 0 ? normalizeCurrency((totalOneTimeCost / netAnnualBenefit) * 12) : null;
    return {
        horizonYears,
        yearLabels,
        sections,
        totalOneTimeCost,
        totalAnnualRunCost,
        annualSavings,
        netAnnualBenefit,
        totalCostOfOwnership,
        totalBenefit,
        netValue,
        netYearTotals,
        runningNetTotals,
        roiPercent,
        paybackMonths,
    };
}
