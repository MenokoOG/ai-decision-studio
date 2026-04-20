import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateInitiativeDto } from './dto/create-initiative.dto.js';
import type { UpdateInitiativeDto } from './dto/update-initiative.dto.js';

@Injectable()
export class InitiativesService {
    constructor(private readonly prisma: PrismaService) { }

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
