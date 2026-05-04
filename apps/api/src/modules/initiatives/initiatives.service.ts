import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TextEncoder } from 'node:util';

import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateInitiativeDto } from './dto/create-initiative.dto.js';
import type { SaveReadinessDto } from './dto/save-readiness.dto.js';
import type { SaveSnapshotDto } from './dto/save-snapshot.dto.js';
import type { SaveWorkspaceStateDto } from './dto/save-workspace-state.dto.js';
import type { UpdateInitiativeDto } from './dto/update-initiative.dto.js';

type ReadinessStatus = 'unknown' | 'draft' | 'ready';
type ReadinessMap = Record<string, { status?: string }>;
type WorksheetLine = {
    key: string;
    label: string;
    description: string;
    oneTime: number;
    annual: number;
};

type InitiativeExportInput = {
    initiative: {
        id: string;
        title: string;
        summary: string;
        owner: string;
        phase: string;
        updatedAt: string;
    };
    assumptions: {
        baselineAnnualCost: number;
        horizonYears: number;
        worksheet: {
            costRows: WorksheetLine[];
            benefitRows: WorksheetLine[];
            mitigationRows: WorksheetLine[];
        };
    };
    preview: {
        totalCostOfOwnership: number;
        totalBenefit: number;
        netValue: number;
        netAnnualBenefit: number;
        roiPercent: number | null;
        paybackMonths: number | null;
    };
    readiness?: {
        confidenceScore: number | null;
        items: Array<{
            key: string;
            label: string;
            status: ReadinessStatus;
            notes?: string;
        }>;
    };
    exportedAt?: string;
};

function scoreReadiness(readiness: ReadinessMap) {
    const statuses = Object.values(readiness).map((item) => item?.status ?? 'unknown');

    if (statuses.length === 0) {
        return {
            confidenceScore: 0,
            readyCount: 0,
            draftCount: 0,
            unknownCount: 0,
        };
    }

    let readyCount = 0;
    let draftCount = 0;
    let unknownCount = 0;
    let weightedScore = 0;

    for (const status of statuses) {
        if (status === 'ready') {
            readyCount += 1;
            weightedScore += 1;
        } else if (status === 'draft') {
            draftCount += 1;
            weightedScore += 0.5;
        } else {
            unknownCount += 1;
        }
    }

    return {
        confidenceScore: Number(((weightedScore / statuses.length) * 100).toFixed(1)),
        readyCount,
        draftCount,
        unknownCount,
    };
}

function asReadinessMap(value: unknown): ReadinessMap {
    if (!value || typeof value !== 'object') {
        return {};
    }

    return value as ReadinessMap;
}

function normalizeReadinessPayload(input: Record<string, unknown>) {
    const normalized = Object.fromEntries(
        Object.entries(input).map(([key, raw]) => {
            const value = typeof raw === 'object' && raw !== null ? (raw as { status?: unknown }) : {};
            const status = value.status === 'ready' || value.status === 'draft' || value.status === 'unknown'
                ? (value.status as ReadinessStatus)
                : 'unknown';
            return [key, { status }];
        }),
    );

    return normalized as ReadinessMap;
}

@Injectable()
export class InitiativesService {
    constructor(
        @Inject(PrismaService)
        private readonly prisma: PrismaService,
    ) { }

    list() {
        return this.prisma.initiative.findMany({
            orderBy: {
                updatedAt: 'desc',
            },
        });
    }

    async getById(id: string) {
        const initiative = await this.prisma.initiative.findUnique({
            where: { id },
        });

        if (!initiative) {
            throw new NotFoundException(`Initiative ${id} was not found.`);
        }

        return initiative;
    }

    create(payload: CreateInitiativeDto) {
        return this.prisma.initiative.create({
            data: {
                title: payload.title,
                summary: payload.summary,
                owner: payload.owner,
                phase: payload.phase,
            },
        });
    }

    async update(id: string, payload: UpdateInitiativeDto) {
        await this.getById(id);

        return this.prisma.initiative.update({
            where: { id },
            data: payload,
        });
    }

    async getWorkspaceState(id: string) {
        await this.getById(id);

        const event = await this.prisma.auditEvent.findFirst({
            where: {
                initiativeId: id,
                eventType: 'workspace_state_saved',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!event) {
            return {
                initiativeId: id,
                state: null,
                savedAt: null,
            };
        }

        const payload = (event.payload ?? null) as { state?: unknown } | null;

        return {
            initiativeId: id,
            state: payload?.state ?? null,
            savedAt: event.createdAt,
        };
    }

    async saveWorkspaceState(id: string, state: SaveWorkspaceStateDto) {
        await this.getById(id);

        const serializedState = JSON.parse(JSON.stringify(state)) as Prisma.InputJsonValue;
        const normalizedReadiness = normalizeReadinessPayload(state.readiness);
        const readinessScore = scoreReadiness(normalizedReadiness);

        const serializedReadiness = JSON.parse(
            JSON.stringify(normalizedReadiness),
        ) as Prisma.InputJsonValue;

        const event = await this.prisma.$transaction(async (tx) => {
            await tx.initiative.update({
                where: { id },
                data: {
                    readinessJson: serializedReadiness,
                    confidenceScore: readinessScore.confidenceScore,
                },
            });

            return tx.auditEvent.create({
                data: {
                    initiativeId: id,
                    actorType: 'USER',
                    eventType: 'workspace_state_saved',
                    eventSource: 'web',
                    payload: {
                        state: serializedState,
                    } as Prisma.InputJsonObject,
                },
            });
        });

        return {
            initiativeId: id,
            savedAt: event.createdAt,
        };
    }

    async getConfidence(id: string) {
        const initiative = await this.getById(id);
        let readiness = asReadinessMap(initiative.readinessJson ?? null);

        if (Object.keys(readiness).length === 0) {
            const workspaceState = await this.getWorkspaceState(id);
            const state = (workspaceState.state ?? null) as {
                readiness?: Record<string, { status?: string }>;
            } | null;
            readiness = state?.readiness ?? {};
        }

        const scored = scoreReadiness(readiness);

        return {
            initiativeId: id,
            confidenceScore: scored.confidenceScore,
            readyCount: scored.readyCount,
            draftCount: scored.draftCount,
            unknownCount: scored.unknownCount,
        };
    }

    async getReadiness(id: string) {
        const initiative = await this.getById(id);
        const readiness = asReadinessMap(initiative.readinessJson ?? null);
        const scored = scoreReadiness(readiness);

        return {
            initiativeId: id,
            readiness,
            confidenceScore: scored.confidenceScore,
            readyCount: scored.readyCount,
            draftCount: scored.draftCount,
            unknownCount: scored.unknownCount,
        };
    }

    async saveReadiness(id: string, payload: SaveReadinessDto) {
        await this.getById(id);

        const readiness = normalizeReadinessPayload(payload.readiness);
        const scored = scoreReadiness(readiness);
        const serializedReadiness = JSON.parse(JSON.stringify(readiness)) as Prisma.InputJsonValue;

        await this.prisma.initiative.update({
            where: { id },
            data: {
                readinessJson: serializedReadiness,
                confidenceScore: scored.confidenceScore,
            },
        });

        await this.prisma.auditEvent.create({
            data: {
                initiativeId: id,
                actorType: 'USER',
                eventType: 'readiness_saved',
                eventSource: 'web',
                payload: {
                    readiness: serializedReadiness,
                } as Prisma.InputJsonObject,
            },
        });

        return {
            initiativeId: id,
            readiness,
            confidenceScore: scored.confidenceScore,
            readyCount: scored.readyCount,
            draftCount: scored.draftCount,
            unknownCount: scored.unknownCount,
        };
    }

    async listSnapshots(id: string) {
        await this.getById(id);

        const snapshots = await this.prisma.businessCaseSnapshot.findMany({
            where: {
                initiativeId: id,
            },
            orderBy: {
                version: 'desc',
            },
            take: 20,
        });

        if (snapshots.length > 0) {
            return {
                initiativeId: id,
                snapshots: snapshots.map((snapshot) => ({
                    snapshotId: snapshot.id,
                    version: snapshot.version,
                    savedAt: snapshot.createdAt,
                    snapshot: {
                        input: snapshot.input,
                        result: snapshot.result,
                        label: snapshot.label,
                    },
                })),
            };
        }

        const events = await this.prisma.auditEvent.findMany({
            where: {
                initiativeId: id,
                eventType: 'business_case_snapshot_saved',
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20,
        });

        return {
            initiativeId: id,
            snapshots: events.map((event) => {
                const payload = (event.payload ?? null) as { snapshot?: unknown } | null;

                return {
                    snapshotId: event.id,
                    version: null,
                    savedAt: event.createdAt,
                    snapshot: payload?.snapshot ?? null,
                };
            }),
        };
    }

    async saveSnapshot(id: string, snapshot: SaveSnapshotDto) {
        await this.getById(id);

        const serializedSnapshot = JSON.parse(JSON.stringify(snapshot)) as Prisma.InputJsonValue;
        const snapshotRecord = await this.prisma.$transaction(async (tx) => {
            const latest = await tx.businessCaseSnapshot.findFirst({
                where: {
                    initiativeId: id,
                },
                orderBy: {
                    version: 'desc',
                },
                select: {
                    version: true,
                },
            });

            const version = (latest?.version ?? 0) + 1;

            const record = await tx.businessCaseSnapshot.create({
                data: {
                    initiativeId: id,
                    version,
                    label: snapshot.label ?? null,
                    input: JSON.parse(JSON.stringify(snapshot.input)) as Prisma.InputJsonValue,
                    result: JSON.parse(JSON.stringify(snapshot.result)) as Prisma.InputJsonValue,
                },
            });

            await tx.auditEvent.create({
                data: {
                    initiativeId: id,
                    actorType: 'USER',
                    eventType: 'business_case_snapshot_saved',
                    eventSource: 'web',
                    payload: {
                        snapshot: serializedSnapshot,
                        snapshotId: record.id,
                        version,
                    } as Prisma.InputJsonObject,
                },
            });

            return record;
        });

        return {
            initiativeId: id,
            snapshotId: snapshotRecord.id,
            version: snapshotRecord.version,
            savedAt: snapshotRecord.createdAt,
        };
    }

    async remove(id: string) {
        await this.getById(id);

        await this.prisma.initiative.delete({
            where: { id },
        });

        return {
            deleted: true,
            id,
        };
    }

    private sanitizeSegment(value: string) {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 80);
    }

    private asNumber(value: unknown) {
        return typeof value === 'number' && Number.isFinite(value) ? value : 0;
    }

    private asWorksheetLineArray(value: unknown): WorksheetLine[] {
        if (!Array.isArray(value)) return [];
        return value.map((row, index) => {
            const item = row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
            return {
                key: String(item.key ?? `row-${index + 1}`),
                label: String(item.label ?? ''),
                description: String(item.description ?? ''),
                oneTime: this.asNumber(item.oneTime),
                annual: this.asNumber(item.annual),
            };
        });
    }

    private escapeCsv(value: unknown) {
        const text = String(value ?? '');
        if (!text.includes(',') && !text.includes('"') && !text.includes('\n')) {
            return text;
        }
        return `"${text.replace(/"/g, '""')}"`;
    }

    private async buildExportInput(id: string): Promise<InitiativeExportInput> {
        const initiative = await this.getById(id);
        const stateResult = await this.getWorkspaceState(id);
        const snapshotsResult = await this.listSnapshots(id);
        const latestSnapshot = snapshotsResult.snapshots[0] as
            | { snapshot?: { result?: unknown } }
            | undefined;
        const preview = (latestSnapshot?.snapshot?.result ?? {
            totalCostOfOwnership: 0,
            totalBenefit: 0,
            netValue: 0,
            netAnnualBenefit: 0,
            roiPercent: 0,
            paybackMonths: null,
        }) as InitiativeExportInput['preview'];
        const rawState = (stateResult.state ?? {}) as Record<string, unknown>;
        const workspaceInput = (rawState.input ?? {}) as Record<string, unknown>;
        const worksheet =
            workspaceInput.worksheet && typeof workspaceInput.worksheet === 'object'
                ? (workspaceInput.worksheet as Record<string, unknown>)
                : {};
        const assumptions = {
            baselineAnnualCost: this.asNumber(workspaceInput.baselineAnnualCost),
            horizonYears: this.asNumber(workspaceInput.horizonYears),
            worksheet: {
                costRows: this.asWorksheetLineArray(worksheet.costRows),
                benefitRows: this.asWorksheetLineArray(worksheet.benefitRows),
                mitigationRows: this.asWorksheetLineArray(worksheet.mitigationRows),
            },
        };
        const readinessRaw = (rawState['readiness'] ?? {}) as Record<
            string,
            { status?: string }
        >;
        const readinessItems = Object.entries(readinessRaw).map(([key, value]) => ({
            key,
            label: key,
            status: (value?.status ?? 'unknown') as 'unknown' | 'draft' | 'ready',
        }));
        const confidenceResult = scoreReadiness(readinessRaw);

        return {
            initiative: {
                id: initiative.id,
                title: initiative.title,
                summary: initiative.summary ?? '',
                owner: initiative.owner ?? '',
                phase: initiative.phase ?? 'DISCOVERY',
                updatedAt: initiative.updatedAt.toISOString(),
            },
            assumptions,
            preview,
            readiness: {
                confidenceScore: confidenceResult.confidenceScore,
                items: readinessItems,
            },
            exportedAt: new Date().toISOString(),
        };
    }

    async exportExcel(id: string) {
        const input = await this.buildExportInput(id);
        const exportedAt = input.exportedAt ?? new Date().toISOString();
        const datePart = exportedAt.slice(0, 10);
        const slug = this.sanitizeSegment(input.initiative.title) || 'initiative';
        const fileName = `${slug}-${datePart}.csv`;

        const rows: string[][] = [
            ['Section', 'Field', 'Value'],
            ['Initiative', 'Title', input.initiative.title],
            ['Initiative', 'Summary', input.initiative.summary],
            ['Initiative', 'Owner', input.initiative.owner],
            ['Initiative', 'Phase', input.initiative.phase],
            ['Initiative', 'Last Updated', input.initiative.updatedAt],
            ['Business Case', 'Baseline Annual Cost', input.assumptions.baselineAnnualCost.toString()],
            ['Business Case', 'Horizon Years', input.assumptions.horizonYears.toString()],
            ['Outputs', 'Total Cost of Ownership', input.preview.totalCostOfOwnership.toString()],
            ['Outputs', 'Total Benefit', input.preview.totalBenefit.toString()],
            ['Outputs', 'Net Value', input.preview.netValue.toString()],
            ['Outputs', 'Net Annual Benefit', input.preview.netAnnualBenefit.toString()],
            ['Outputs', 'ROI Percent', input.preview.roiPercent?.toString() ?? ''],
            ['Outputs', 'Payback Months', input.preview.paybackMonths?.toString() ?? ''],
            ['Readiness', 'Confidence Score', input.readiness?.confidenceScore?.toString() ?? ''],
        ];

        for (const item of input.readiness?.items ?? []) {
            rows.push(['Readiness Item', item.label, item.status]);
        }

        for (const row of input.assumptions.worksheet.costRows) {
            rows.push(['Cost Row', row.label, `${row.oneTime}|${row.annual}|${row.description}`]);
        }

        for (const row of input.assumptions.worksheet.benefitRows) {
            rows.push(['Benefit Row', row.label, `${row.oneTime}|${row.annual}|${row.description}`]);
        }

        for (const row of input.assumptions.worksheet.mitigationRows) {
            rows.push(['Mitigation Row', row.label, `${row.oneTime}|${row.annual}|${row.description}`]);
        }

        const csv = rows
            .map((row) => row.map((value) => this.escapeCsv(value)).join(','))
            .join('\n');

        return {
            fileName,
            buffer: new TextEncoder().encode(csv),
        };
    }

    async exportMarkdown(id: string) {
        const input = await this.buildExportInput(id);
        const exportedAt = input.exportedAt ?? new Date().toISOString();
        const datePart = exportedAt.slice(0, 10);
        const slug = this.sanitizeSegment(input.initiative.title) || 'initiative';
        const fileName = `${slug}-${datePart}.md`;

        const lines: string[] = [
            `# ${input.initiative.title}`,
            '',
            `- Initiative ID: ${input.initiative.id}`,
            `- Owner: ${input.initiative.owner || 'n/a'}`,
            `- Phase: ${input.initiative.phase}`,
            `- Last Updated: ${input.initiative.updatedAt}`,
            `- Exported At: ${exportedAt}`,
            '',
            '## Summary',
            '',
            input.initiative.summary || 'No summary provided.',
            '',
            '## Business Case Inputs',
            '',
            `- Baseline Annual Cost: ${input.assumptions.baselineAnnualCost}`,
            `- Horizon Years: ${input.assumptions.horizonYears}`,
            '',
            '## Outputs',
            '',
            `- Total Cost of Ownership: ${input.preview.totalCostOfOwnership}`,
            `- Total Benefit: ${input.preview.totalBenefit}`,
            `- Net Value: ${input.preview.netValue}`,
            `- Net Annual Benefit: ${input.preview.netAnnualBenefit}`,
            `- ROI Percent: ${input.preview.roiPercent ?? 'n/a'}`,
            `- Payback Months: ${input.preview.paybackMonths ?? 'n/a'}`,
            '',
            '## Readiness',
            '',
            `- Confidence Score: ${input.readiness?.confidenceScore ?? 0}`,
        ];

        if ((input.readiness?.items.length ?? 0) > 0) {
            lines.push('', '| Category | Status |', '|---|---|');
            for (const item of input.readiness?.items ?? []) {
                lines.push(`| ${item.label} | ${item.status} |`);
            }
        }

        return {
            fileName,
            content: lines.join('\n'),
        };
    }
}
