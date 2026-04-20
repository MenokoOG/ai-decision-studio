# Worksheet Parity Audit (Initial)

Date: 2026-04-20
Source folder: original-worksheets

## Source files discovered

1. 1 Framework for High Level Strategy and Investment Decisions in Gen AI.xlsx
2. 2 Framework for Cross Functional Decisions in Gen AI.xlsx
3. AI Industry use cases.xlsx
4. 3 End-to-end AI Delivery Roadmap.pptx (reference deck, not formula workbook)

## Workbook 1: High Level Strategy and Investment Decisions

Sheet name:

- Template - one sheet per propos

Primary sections discovered from shared strings:

- Costs (Data acquisition, Data science and training, Engineering, Infrastructure, AI API, Operations, Technical support)
- Benefits (Automation, Augmentation, Differentiation)
- Risk mitigations (Technical, Operational, Strategic)
- Running total rows over 5-year horizon

Formula model extracted from sheet XML:

- Per-row Year 1 value: one-time + one-time benefit/cost columns
- Per-row Year 2..5 values: annual + annual benefit/cost columns
- Per-row 5-year total: sum Year1..Year5
- Section totals:
  - Costs total row sums all cost rows
  - Benefits total row sums all benefit rows
  - Risk mitigation total row sums all mitigation rows
- Grand total row: costs + benefits + mitigation totals by year
- Running cumulative row:
  - Year 1 running = grand total Year 1
  - Year N running = previous running + current grand total

Concrete formula anchors observed:

- H20 = $D20+$F20
- I20:L20 = $E20+$G20
- M20 = SUM(H20:L20)
- H29 = SUM(H20:H28)
- H33 = $D33+$F33
- I33:L33 = $E33+$G33
- H36 = SUM(H33:H35)
- H40 = $D40+$F40
- I40:L40 = $E40+$G40
- H43 = SUM(H40:H42)
- H45 = H29+H36+H43
- H46 = H45
- I46:L46 = prior running + current total (H46+I45 pattern)

Notes:

- The pattern uses shared formulas; references above are the root cells for each shared range.
- Current app business-case calculator is a simplified model and does not yet encode the full row-by-row worksheet structure.

## Workbook 2: Cross Functional Decisions

Sheet name:

- Template - one sheet per propos

Sections discovered:

- Stakeholder matrix by function
- COST / BENEFIT / RISKS / RECOMMENDATION decision table
- Model options (frontier, low-cost, comparisons, open source)
- Optimization levers (multi-shot prompting, RAG, agents, fine-tuning)
- Infrastructure options (managed ML, abstraction layer)

Formula status:

- No explicit Excel formulas detected in sheet XML.
- This worksheet appears to be a structured qualitative and scoring template that should map to typed decision records and deterministic scoring rules in app domain logic.

## Workbook 3: AI Industry use cases

Purpose:

- Reference catalog for template seeding and use-case ideation by industry.
- Not a calculator workbook.

## Implementation implications

1. Introduce worksheet-parity data model for Workbook 1 line items by section and row.
2. Add deterministic yearly projection engine (Year1, Year2..Year5, 5-year total, section totals, grand totals, running cumulative).
3. Keep all numeric outputs deterministic in calculators package, not renderer.
4. Preserve current simplified mode as compatibility path only if needed during migration.
5. Map Workbook 2 into decision framework entities with deterministic weighted scoring plus rationale capture.

## Proposed next build slice

1. Add workbook-parity domain types for cost/benefit/mitigation rows.
2. Add new calculator function mirroring Workbook 1 formulas exactly.
3. Add renderer form groups for each row category from Workbook 1.
4. Persist new parity fields and computed outputs to SQLite.
5. Expand Markdown export to include worksheet-parity tables and running totals.
