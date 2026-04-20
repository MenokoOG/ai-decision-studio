import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateInitiativeDto } from './dto/create-initiative.dto.js';
import type { SaveSnapshotDto } from './dto/save-snapshot.dto.js';
import type { SaveWorkspaceStateDto } from './dto/save-workspace-state.dto.js';
import type { UpdateInitiativeDto } from './dto/update-initiative.dto.js';

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

        const event = await this.prisma.auditEvent.create({
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

        return {
            initiativeId: id,
            savedAt: event.createdAt,
        };
    }

    async getConfidence(id: string) {
        const workspaceState = await this.getWorkspaceState(id);
        const state = (workspaceState.state ?? null) as {
            readiness?: Record<string, { status?: string }>;
        } | null;

        const readiness = state?.readiness ?? {};
        const statuses = Object.values(readiness).map((item) => item?.status ?? 'unknown');

        if (statuses.length === 0) {
            return {
                initiativeId: id,
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

        const confidenceScore = Number(((weightedScore / statuses.length) * 100).toFixed(1));

        return {
            initiativeId: id,
            confidenceScore,
            readyCount,
            draftCount,
            unknownCount,
        };
    }

    async listSnapshots(id: string) {
        await this.getById(id);

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
                    savedAt: event.createdAt,
                    snapshot: payload?.snapshot ?? null,
                };
            }),
        };
    }

    async saveSnapshot(id: string, snapshot: SaveSnapshotDto) {
        await this.getById(id);

        const serializedSnapshot = JSON.parse(JSON.stringify(snapshot)) as Prisma.InputJsonValue;

        const event = await this.prisma.auditEvent.create({
            data: {
                initiativeId: id,
                actorType: 'USER',
                eventType: 'business_case_snapshot_saved',
                eventSource: 'web',
                payload: {
                    snapshot: serializedSnapshot,
                } as Prisma.InputJsonObject,
            },
        });

        return {
            initiativeId: id,
            snapshotId: event.id,
            savedAt: event.createdAt,
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
