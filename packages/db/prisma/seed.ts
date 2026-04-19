import { PrismaClient, InitiativePhase } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
    {
        slug: 'cx-ai-assistant',
        title: 'Customer Support AI Assistant',
        industry: 'Customer Experience',
        summary: 'Deflect repetitive tickets while improving first-response quality and SLA stability.',
        oneLiner: 'Support teams automate repetitive inquiries with human-in-the-loop escalation.',
        defaultPhase: InitiativePhase.DISCOVERY,
    },
    {
        slug: 'ops-demand-forecasting',
        title: 'Demand Forecasting Optimization',
        industry: 'Operations',
        summary: 'Improve inventory, staffing, and procurement decisions with forecast confidence ranges.',
        oneLiner: 'Forecast demand volatility to reduce stockouts and overstaffing costs.',
        defaultPhase: InitiativePhase.DESIGN,
    },
    {
        slug: 'finance-ap-automation',
        title: 'Accounts Payable Automation',
        industry: 'Finance',
        summary: 'Accelerate invoice processing with deterministic validation and AI-assisted exception routing.',
        oneLiner: 'Shorten cycle times while preserving auditable financial controls.',
        defaultPhase: InitiativePhase.BUILD,
    },
    {
        slug: 'engineering-incident-copilot',
        title: 'Incident Response Copilot',
        industry: 'Engineering',
        summary: 'Improve MTTR with retrieval-based runbook assistance and guided remediation prompts.',
        oneLiner: 'On-call teams resolve incidents faster with governed operational context.',
        defaultPhase: InitiativePhase.PILOT,
    },
];

async function main() {
    for (const template of templates) {
        await prisma.template.upsert({
            where: { slug: template.slug },
            create: template,
            update: {
                title: template.title,
                industry: template.industry,
                summary: template.summary,
                oneLiner: template.oneLiner,
                defaultPhase: template.defaultPhase,
            },
        });
    }

    await prisma.auditEvent.create({
        data: {
            actorType: 'SYSTEM',
            eventType: 'template.seed.completed',
            eventSource: 'prisma.seed',
            payload: {
                templateCount: templates.length,
            },
        },
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        await prisma.$disconnect();
        throw error;
    });
