import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { z } from 'zod';

import { evaluateBusinessCase } from '../../../../packages/calculators/src/businessCase';
import { db } from '../../../../packages/db/src/client';
import {
  IPC_CHANNELS,
  type BusinessCasePreviewInput,
  type BusinessCaseWorkspace,
  type DecisionMatrixOptionInput,
  type DecisionMatrixWorkspace,
  type InitiativeSummary,
  type RoadmapPhaseInput,
  type RoadmapWorkspace,
} from '../shared/ipc';

const BUSINESS_CASE_SAVED_EVENT = 'business-case.saved';
const INITIATIVE_CREATED_EVENT = 'initiative.created';
const IMPLEMENTATION_CATEGORY = 'IMPLEMENTATION';
const SAVINGS_CATEGORY = 'SAVINGS';
const DECISION_OPTION_TYPE = 'delivery-option';
const DEFAULT_ASSUMPTIONS: BusinessCasePreviewInput = {
  baselineAnnualCost: 220000,
  expectedAnnualCostReduction: 140000,
  implementationOneTimeCost: 120000,
  implementationAnnualCost: 30000,
  horizonYears: 5,
};

const businessCasePreviewSchema = z.object({
  baselineAnnualCost: z.number().min(0),
  expectedAnnualCostReduction: z.number().min(0),
  implementationOneTimeCost: z.number().min(0),
  implementationAnnualCost: z.number().min(0),
  horizonYears: z.number().int().min(1).max(10),
});

const initiativeIdSchema = z.string().min(1);
const templateSlugSchema = z.string().min(1);
const decisionMatrixOptionSchema = z.object({
  optionName: z.string().trim().min(1),
  costScore: z.number().min(0).max(10),
  benefitScore: z.number().min(0).max(10),
  riskScore: z.number().min(0).max(10),
  fitScore: z.number().min(0).max(10),
  rationale: z.string().optional(),
});
const decisionMatrixOptionsSchema = z.array(decisionMatrixOptionSchema).min(1).max(12);
const roadmapPhaseSchema = z.object({
  title: z.string().trim().min(1),
  lane: z.string().trim().min(1),
  deliverables: z.string(),
  startDate: z.string().datetime().nullable(),
  endDate: z.string().datetime().nullable(),
});
const roadmapPhasesSchema = z.array(roadmapPhaseSchema).min(1).max(20);

type StoredEventPayload = {
  templateSlug?: string;
  baselineAnnualCost?: number;
  horizonYears?: number;
};

function getTemplateSlugFromPayload(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const maybeSlug = (payload as StoredEventPayload).templateSlug;
  return typeof maybeSlug === 'string' ? maybeSlug : null;
}

function toInitiativeSummary(
  initiative: {
    id: string;
    title: string;
    summary: string;
    owner: string;
    phase: string;
    updatedAt: Date;
    auditEvents: Array<{ payload: unknown }>;
  },
): InitiativeSummary {
  const createdEvent = initiative.auditEvents[0];

  return {
    id: initiative.id,
    title: initiative.title,
    summary: initiative.summary,
    owner: initiative.owner,
    phase: initiative.phase,
    templateSlug: getTemplateSlugFromPayload(createdEvent?.payload),
    updatedAt: initiative.updatedAt.toISOString(),
  };
}

function getPersistedAssumptions(
  savedEventPayload: unknown,
  implementationOneTimeCost: number,
  implementationAnnualCost: number,
  expectedAnnualCostReduction: number,
): BusinessCasePreviewInput {
  const payload =
    savedEventPayload && typeof savedEventPayload === 'object'
      ? (savedEventPayload as StoredEventPayload)
      : {};

  const baselineAnnualCost =
    typeof payload.baselineAnnualCost === 'number'
      ? payload.baselineAnnualCost
      : DEFAULT_ASSUMPTIONS.baselineAnnualCost;

  const horizonYears =
    typeof payload.horizonYears === 'number' ? Math.max(1, Math.trunc(payload.horizonYears)) : 5;

  return {
    baselineAnnualCost,
    expectedAnnualCostReduction,
    implementationOneTimeCost,
    implementationAnnualCost,
    horizonYears,
  };
}

function normalizeScore(value: number) {
  return Math.round(value * 100) / 100;
}

function computeDecisionTotalScore(option: DecisionMatrixOptionInput) {
  const score =
    option.benefitScore * 0.35 +
    option.fitScore * 0.3 +
    (10 - option.costScore) * 0.2 +
    (10 - option.riskScore) * 0.15;

  return normalizeScore(score);
}

async function buildDecisionMatrixWorkspace(initiativeId: string): Promise<DecisionMatrixWorkspace> {
  const decisions = await db.decision.findMany({
    where: { initiativeId },
    orderBy: [{ totalScore: 'desc' }, { optionName: 'asc' }],
  });

  const options = decisions.map((decision) => ({
    id: decision.id,
    optionName: decision.optionName,
    costScore: decision.costScore,
    benefitScore: decision.benefitScore,
    riskScore: decision.riskScore,
    fitScore: decision.fitScore,
    totalScore: decision.totalScore,
    recommendation: decision.recommendation,
    rationale: decision.rationale,
  }));

  const recommended = options.find((option) => option.recommendation === 'Recommended') ?? options[0] ?? null;

  return {
    initiativeId,
    options,
    recommendedOptionId: recommended?.id ?? null,
  };
}

async function buildRoadmapWorkspace(initiativeId: string): Promise<RoadmapWorkspace> {
  const phases = await db.roadmapPhase.findMany({
    where: { initiativeId },
    orderBy: [{ sortOrder: 'asc' }, { phaseNumber: 'asc' }],
  });

  return {
    initiativeId,
    phases: phases.map((phase) => ({
      id: phase.id,
      phaseNumber: phase.phaseNumber,
      sortOrder: phase.sortOrder,
      title: phase.title,
      lane: phase.lane,
      deliverables: phase.deliverables,
      startDate: phase.startDate ? phase.startDate.toISOString() : null,
      endDate: phase.endDate ? phase.endDate.toISOString() : null,
    })),
  };
}

async function buildWorkspace(initiativeId: string): Promise<BusinessCaseWorkspace> {
  const initiative = await db.initiative.findUniqueOrThrow({
    where: { id: initiativeId },
    include: {
      costLines: true,
      benefitLines: true,
      auditEvents: {
        where: {
          eventType: {
            in: [INITIATIVE_CREATED_EVENT, BUSINESS_CASE_SAVED_EVENT],
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const implementationCostLines = initiative.costLines.filter(
    (line) => line.category === IMPLEMENTATION_CATEGORY,
  );

  const savingsLines = initiative.benefitLines.filter((line) => line.category === SAVINGS_CATEGORY);

  const implementationOneTimeCost = implementationCostLines.reduce(
    (sum, line) => sum + line.oneTime,
    0,
  );

  const implementationAnnualCost = implementationCostLines.reduce((sum, line) => sum + line.annual, 0);

  const expectedAnnualCostReduction = savingsLines.reduce((sum, line) => sum + line.annual, 0);

  const latestSavedEvent = initiative.auditEvents.find(
    (event) => event.eventType === BUSINESS_CASE_SAVED_EVENT,
  );

  const assumptions = getPersistedAssumptions(
    latestSavedEvent?.payload,
    implementationOneTimeCost,
    implementationAnnualCost,
    expectedAnnualCostReduction,
  );

  return {
    initiative: toInitiativeSummary({
      id: initiative.id,
      title: initiative.title,
      summary: initiative.summary,
      owner: initiative.owner,
      phase: initiative.phase,
      updatedAt: initiative.updatedAt,
      auditEvents: initiative.auditEvents,
    }),
    assumptions,
    preview: evaluateBusinessCase({
      baselineAnnualCost: assumptions.baselineAnnualCost,
      expectedAnnualCostReduction: assumptions.expectedAnnualCostReduction,
      implementationCosts: [
        {
          oneTime: assumptions.implementationOneTimeCost,
          annual: assumptions.implementationAnnualCost,
        },
      ],
      horizonYears: assumptions.horizonYears,
    }),
  };
}

function registerIpcHandlers() {
  ipcMain.handle(IPC_CHANNELS.listTemplates, async () => {
    const templates = await db.template.findMany({
      orderBy: [{ industry: 'asc' }, { title: 'asc' }],
    });

    return templates.map((template) => ({
      id: template.id,
      slug: template.slug,
      title: template.title,
      industry: template.industry,
      summary: template.summary,
      oneLiner: template.oneLiner,
      defaultPhase: template.defaultPhase,
    }));
  });

  ipcMain.handle(IPC_CHANNELS.previewBusinessCase, (_event, payload: BusinessCasePreviewInput) => {
    const parsed = businessCasePreviewSchema.parse(payload);

    return evaluateBusinessCase({
      baselineAnnualCost: parsed.baselineAnnualCost,
      expectedAnnualCostReduction: parsed.expectedAnnualCostReduction,
      implementationCosts: [
        {
          oneTime: parsed.implementationOneTimeCost,
          annual: parsed.implementationAnnualCost,
        },
      ],
      horizonYears: parsed.horizonYears,
    });
  });

  ipcMain.handle(IPC_CHANNELS.createInitiativeFromTemplate, async (_event, templateSlug: string) => {
    const parsedSlug = templateSlugSchema.parse(templateSlug);
    const template = await db.template.findUniqueOrThrow({ where: { slug: parsedSlug } });

    const initiative = await db.initiative.create({
      data: {
        title: template.title,
        summary: template.oneLiner,
        owner: 'Unassigned',
        phase: template.defaultPhase,
        auditEvents: {
          create: {
            actorType: 'USER',
            eventType: INITIATIVE_CREATED_EVENT,
            eventSource: 'renderer.home',
            payload: {
              templateSlug: template.slug,
              templateId: template.id,
            },
          },
        },
      },
    });

    await db.costLine.create({
      data: {
        initiativeId: initiative.id,
        category: IMPLEMENTATION_CATEGORY,
        oneTime: DEFAULT_ASSUMPTIONS.implementationOneTimeCost,
        annual: DEFAULT_ASSUMPTIONS.implementationAnnualCost,
        notes: 'Template default implementation costs',
        sortOrder: 0,
      },
    });

    await db.benefitLine.create({
      data: {
        initiativeId: initiative.id,
        category: SAVINGS_CATEGORY,
        oneTime: 0,
        annual: DEFAULT_ASSUMPTIONS.expectedAnnualCostReduction,
        notes: 'Template default annual savings',
        sortOrder: 0,
      },
    });

    await db.auditEvent.create({
      data: {
        initiativeId: initiative.id,
        actorType: 'USER',
        eventType: BUSINESS_CASE_SAVED_EVENT,
        eventSource: 'renderer.home',
        payload: {
          baselineAnnualCost: DEFAULT_ASSUMPTIONS.baselineAnnualCost,
          horizonYears: DEFAULT_ASSUMPTIONS.horizonYears,
        },
      },
    });

    return buildWorkspace(initiative.id);
  });

  ipcMain.handle(IPC_CHANNELS.listInitiatives, async () => {
    const initiatives = await db.initiative.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        auditEvents: {
          where: { eventType: INITIATIVE_CREATED_EVENT },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { payload: true },
        },
      },
    });

    return initiatives.map((initiative) => toInitiativeSummary(initiative));
  });

  ipcMain.handle(IPC_CHANNELS.getInitiativeWorkspace, async (_event, initiativeId: string) => {
    const parsedId = initiativeIdSchema.parse(initiativeId);
    return buildWorkspace(parsedId);
  });

  ipcMain.handle(
    IPC_CHANNELS.saveBusinessCase,
    async (_event, initiativeId: string, payload: BusinessCasePreviewInput) => {
      const parsedId = initiativeIdSchema.parse(initiativeId);
      const parsed = businessCasePreviewSchema.parse(payload);

      const initiative = await db.initiative.findUniqueOrThrow({ where: { id: parsedId } });

      const implementationLine = await db.costLine.findFirst({
        where: {
          initiativeId: initiative.id,
          category: IMPLEMENTATION_CATEGORY,
        },
        orderBy: { sortOrder: 'asc' },
      });

      if (implementationLine) {
        await db.costLine.update({
          where: { id: implementationLine.id },
          data: {
            oneTime: parsed.implementationOneTimeCost,
            annual: parsed.implementationAnnualCost,
          },
        });
      } else {
        await db.costLine.create({
          data: {
            initiativeId: initiative.id,
            category: IMPLEMENTATION_CATEGORY,
            oneTime: parsed.implementationOneTimeCost,
            annual: parsed.implementationAnnualCost,
            notes: 'Saved implementation costs',
            sortOrder: 0,
          },
        });
      }

      const savingsLine = await db.benefitLine.findFirst({
        where: {
          initiativeId: initiative.id,
          category: SAVINGS_CATEGORY,
        },
        orderBy: { sortOrder: 'asc' },
      });

      if (savingsLine) {
        await db.benefitLine.update({
          where: { id: savingsLine.id },
          data: {
            annual: parsed.expectedAnnualCostReduction,
          },
        });
      } else {
        await db.benefitLine.create({
          data: {
            initiativeId: initiative.id,
            category: SAVINGS_CATEGORY,
            oneTime: 0,
            annual: parsed.expectedAnnualCostReduction,
            notes: 'Saved annual cost reduction',
            sortOrder: 0,
          },
        });
      }

      await db.auditEvent.create({
        data: {
          initiativeId: initiative.id,
          actorType: 'USER',
          eventType: BUSINESS_CASE_SAVED_EVENT,
          eventSource: 'renderer.home',
          payload: {
            baselineAnnualCost: parsed.baselineAnnualCost,
            horizonYears: parsed.horizonYears,
          },
        },
      });

      return buildWorkspace(initiative.id);
    },
  );

  ipcMain.handle(IPC_CHANNELS.getDecisionMatrix, async (_event, initiativeId: string) => {
    const parsedId = initiativeIdSchema.parse(initiativeId);
    await db.initiative.findUniqueOrThrow({ where: { id: parsedId }, select: { id: true } });
    return buildDecisionMatrixWorkspace(parsedId);
  });

  ipcMain.handle(
    IPC_CHANNELS.saveDecisionMatrix,
    async (_event, initiativeId: string, options: DecisionMatrixOptionInput[]) => {
      const parsedId = initiativeIdSchema.parse(initiativeId);
      const parsedOptions = decisionMatrixOptionsSchema.parse(options);

      await db.initiative.findUniqueOrThrow({ where: { id: parsedId }, select: { id: true } });

      const scoredOptions = parsedOptions.map((option) => ({
        ...option,
        totalScore: computeDecisionTotalScore(option),
      }));

      const bestScore = scoredOptions.reduce((highest, option) => Math.max(highest, option.totalScore), -Infinity);

      await db.decision.deleteMany({ where: { initiativeId: parsedId } });

      for (const option of scoredOptions) {
        let recommendation = 'Consider';

        if (option.totalScore === bestScore) {
          recommendation = 'Recommended';
        } else if (option.totalScore >= bestScore - 0.75) {
          recommendation = 'Strong alternative';
        }

        await db.decision.create({
          data: {
            initiativeId: parsedId,
            optionType: DECISION_OPTION_TYPE,
            optionName: option.optionName,
            costScore: option.costScore,
            benefitScore: option.benefitScore,
            riskScore: option.riskScore,
            fitScore: option.fitScore,
            totalScore: option.totalScore,
            recommendation,
            rationale: option.rationale ?? '',
          },
        });
      }

      return buildDecisionMatrixWorkspace(parsedId);
    },
  );

  ipcMain.handle(IPC_CHANNELS.getRoadmap, async (_event, initiativeId: string) => {
    const parsedId = initiativeIdSchema.parse(initiativeId);
    await db.initiative.findUniqueOrThrow({ where: { id: parsedId }, select: { id: true } });
    return buildRoadmapWorkspace(parsedId);
  });

  ipcMain.handle(
    IPC_CHANNELS.saveRoadmap,
    async (_event, initiativeId: string, phases: RoadmapPhaseInput[]) => {
      const parsedId = initiativeIdSchema.parse(initiativeId);
      const parsedPhases = roadmapPhasesSchema.parse(phases);

      await db.initiative.findUniqueOrThrow({ where: { id: parsedId }, select: { id: true } });

      await db.roadmapPhase.deleteMany({ where: { initiativeId: parsedId } });

      for (const [index, phase] of parsedPhases.entries()) {
        await db.roadmapPhase.create({
          data: {
            initiativeId: parsedId,
            phaseNumber: index + 1,
            title: phase.title,
            lane: phase.lane,
            deliverables: phase.deliverables,
            startDate: phase.startDate ? new Date(phase.startDate) : null,
            endDate: phase.endDate ? new Date(phase.endDate) : null,
            sortOrder: index,
          },
        });
      }

      return buildRoadmapWorkspace(parsedId);
    },
  );
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 390,
    minHeight: 700,
    backgroundColor: '#0b1020',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    void window.loadURL('http://localhost:3000');
  } else {
    void window.loadFile(path.join(process.cwd(), 'out/index.html'));
  }
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  void db.$disconnect();
});
