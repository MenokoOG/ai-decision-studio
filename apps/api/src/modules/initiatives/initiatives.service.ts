import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateInitiativeDto } from './dto/create-initiative.dto.js';
import type { SaveReadinessDto } from './dto/save-readiness.dto.js';
import type { SaveSnapshotDto } from './dto/save-snapshot.dto.js';
import type { SaveWorkspaceStateDto } from './dto/save-workspace-state.dto.js';
import type { UpdateInitiativeDto } from './dto/update-initiative.dto.js';

type ReadinessStatus = 'unknown' | 'draft' | 'ready';
type ReadinessMap = Record<string, { status?: string }>;

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
}
