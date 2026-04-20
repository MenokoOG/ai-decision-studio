import { z } from 'zod';

export const worksheetLineSchema = z.object({
  key: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: z.string().trim().min(1),
  oneTime: z.number().min(0),
  annual: z.number().min(0),
});

export const businessCasePreviewSchema = z.object({
  baselineAnnualCost: z.number().min(0),
  horizonYears: z.number().int().min(1).max(10),
  worksheet: z.object({
    costRows: z.array(worksheetLineSchema).min(1),
    benefitRows: z.array(worksheetLineSchema).min(1),
    mitigationRows: z.array(worksheetLineSchema).min(1),
  }),
});

export type BusinessCasePreviewPayload = z.infer<typeof businessCasePreviewSchema>;
