import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

type SnapshotPayload = {
    snapshot?: {
        input?: unknown;
        result?: unknown;
        label?: string | null;
    };
    snapshotId?: string;
    version?: number;
};

async function main() {
    const events = await prisma.auditEvent.findMany({
        where: {
            eventType: 'business_case_snapshot_saved',
            initiativeId: { not: null },
        },
        orderBy: [{ initiativeId: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    });

    let scanned = 0;
    let inserted = 0;
    let skippedDualWrite = 0;
    let skippedAlreadyBackfilled = 0;
    let skippedMalformed = 0;

    const nextVersionByInitiative = new Map<string, number>();

    for (const event of events) {
        scanned++;
        const initiativeId = event.initiativeId!;
        const payload = (event.payload ?? null) as SnapshotPayload | null;
        const snap = payload?.snapshot;

        if (!payload || !snap || snap.input === undefined || snap.result === undefined) {
            console.warn(`[skip:malformed] auditEvent=${event.id} initiative=${initiativeId}`);
            skippedMalformed++;
            continue;
        }

        if (payload.snapshotId) {
            const existing = await prisma.businessCaseSnapshot.findUnique({
                where: { id: payload.snapshotId },
            });
            if (existing) {
                skippedDualWrite++;
                continue;
            }
        }

        const existingByEventId = await prisma.businessCaseSnapshot.findUnique({
            where: { id: event.id },
        });
        if (existingByEventId) {
            skippedAlreadyBackfilled++;
            continue;
        }

        if (!nextVersionByInitiative.has(initiativeId)) {
            const latest = await prisma.businessCaseSnapshot.findFirst({
                where: { initiativeId },
                orderBy: { version: 'desc' },
                select: { version: true },
            });
            nextVersionByInitiative.set(initiativeId, (latest?.version ?? 0) + 1);
        }
        const version = nextVersionByInitiative.get(initiativeId)!;
        nextVersionByInitiative.set(initiativeId, version + 1);

        await prisma.businessCaseSnapshot.create({
            data: {
                id: event.id,
                initiativeId,
                version,
                label: snap.label ?? null,
                input: JSON.parse(JSON.stringify(snap.input)) as Prisma.InputJsonValue,
                result: JSON.parse(JSON.stringify(snap.result)) as Prisma.InputJsonValue,
                createdAt: event.createdAt,
            },
        });
        inserted++;
    }

    console.log('Backfill summary:');
    console.log(`  scanned:                  ${scanned}`);
    console.log(`  inserted:                 ${inserted}`);
    console.log(`  skipped (dual-write):     ${skippedDualWrite}`);
    console.log(`  skipped (already filled): ${skippedAlreadyBackfilled}`);
    console.log(`  skipped (malformed):      ${skippedMalformed}`);
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
