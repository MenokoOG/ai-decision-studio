export interface LineItem {
  oneTime: number;
  annual: number;
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
