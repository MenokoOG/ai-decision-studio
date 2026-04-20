import { NextResponse } from 'next/server';
import { z } from 'zod';

import { evaluateBusinessCase } from '@ai-cost-tool/calculators/src/businessCase';

const worksheetLineSchema = z.object({
  key: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: z.string().trim().min(1),
  oneTime: z.number().min(0),
  annual: z.number().min(0),
});

const requestSchema = z.object({
  baselineAnnualCost: z.number().min(0),
  horizonYears: z.number().int().min(1).max(10),
  worksheet: z.object({
    costRows: z.array(worksheetLineSchema).min(1),
    benefitRows: z.array(worksheetLineSchema).min(1),
    mitigationRows: z.array(worksheetLineSchema).min(1),
  }),
});

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());

    const preview = evaluateBusinessCase({
      baselineAnnualCost: payload.baselineAnnualCost,
      horizonYears: payload.horizonYears,
      worksheet: payload.worksheet,
    });

    return NextResponse.json(preview);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to calculate business case.' }, { status: 500 });
  }
}
