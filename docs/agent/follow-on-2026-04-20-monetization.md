# Follow-On Plan - Monetization First (2026-04-20)

## Objective

Create near-term subscription income for AI Decision Studio while protecting core IP.

## Strategy Choice

- Keep the main product repository private for now.
- Publish the SaaS product publicly (website/demo), not the core source.
- Delay full open source until recurring revenue is stable.

## Why This Path

- Fastest route to paid subscriptions.
- Lower risk of clone-and-host competitors.
- Preserves option to open selected non-core modules later.

## Subscription Model (Initial)

### Tier 1: Solo
- Price target: $29-$49/month
- Audience: independent builders, consultants, small founders
- Includes:
  - Initiative workspace
  - Deterministic business-case modeling
  - Limited number of saved initiatives
  - Basic export

### Tier 2: Team
- Price target: $99-$199/month
- Audience: startups and product/ops teams
- Includes:
  - Team workspaces
  - Higher saved initiative limits
  - Snapshot history
  - Advanced export/report packaging

### Optional Add-On: Advisory
- Price target: custom / higher-ticket
- Includes:
  - Guided setup
  - Decision review support
  - Executive-ready report shaping

## Paywall Boundary (What Must Stay Paid)

- Persisted initiative history and multi-scenario snapshots.
- Advanced report output (board/leadership-ready exports).
- Team collaboration features and higher usage caps.
- Premium template packs and benchmark reference packs.

## What Can Stay Free

- Landing page and product walkthrough.
- A constrained quick estimate mode.
- Limited trial initiatives (e.g., one project cap).

## Technical Implementation Order (Revenue-First)

1. Add auth and account identity baseline.
2. Integrate billing provider (Stripe subscriptions).
3. Implement entitlements middleware (plan checks on API endpoints).
4. Add free-tier limits and paid-tier unlocks.
5. Add account/billing settings pages in web app.
6. Add usage meter events for limits and upgrade prompts.

## API and Data Changes (Minimum Needed)

- Add account and subscription entities.
- Add plan and entitlement fields per user/account.
- Add usage counters (saved initiatives, snapshots, exports).
- Enforce plan checks in server-side write/read paths.

## Weekly Execution Plan

### Week 1
- Billing integration and webhook handling
- Entitlement checks in API
- Basic pricing page and checkout flow

### Week 2
- Limit gates in web UX (clear upgrade prompts)
- Billing settings page
- Trial/free plan onboarding

### Week 3
- Launch offer + outreach campaign
- Capture first paying users
- Iterate pricing based on conversion feedback

## Go-To-Market Checklist

- Publish a simple website section with:
  - Problem solved
  - Before/after value
  - Pricing
  - CTA to subscribe
- Post founder-led demos and customer problem breakdowns.
- Do direct outreach to CTO/product leaders with a short audit offer.

## Legal and IP Risk Notes

- If source worksheets came from a course, avoid copying proprietary workbook content verbatim into public assets.
- Treat worksheet inspiration as reference, but keep app text/structure original where possible.
- Use terms of service and paid plan terms once billing goes live.

## Follow-On Engineering Backlog (Next Sessions)

1. Add billing/auth architecture section to docs and implementation contract.
2. Create Prisma schema extension for subscriptions and entitlements.
3. Build API middleware for plan enforcement.
4. Add web pricing + checkout + manage-subscription pages.
5. Add free-tier limit UX and upgrade prompts.
6. Add telemetry for conversion funnel (view pricing -> checkout -> success).

## Success Metrics (First 30 Days)

- First paid subscription acquired.
- Conversion from active trial users to paid users measured.
- Churn reasons captured from cancellations.
- Pricing page conversion tracked and improved.

## Next Session Prompt

Continue from follow-on monetization plan. Implement billing/auth foundations in API and web with strict entitlement checks for saved initiatives, snapshots, and exports. Update docs/agent/tasks.md and docs/agent/handoff-2026-04-20.md as each slice lands.
