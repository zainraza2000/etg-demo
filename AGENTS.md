# AGENTS.md — context for anyone (or any AI) implementing from this demo

**Read this before treating anything here as a spec.** This repo is a **design demo**, not the product. It exists to show the *intended UX* of the ETG Dashboard. If you're turning it into a real app, the rules below tell you **what is real, what is mock, and — most importantly — what the on-screen tags mean and what to do with them.**

## 1. What this repo is (and isn't)

- **Is:** a static, build-free **prototype** — React (UMD) + in-browser Babel + lucide + Google Fonts, all from CDN. Inline styles using ETG design tokens. Mock data only. Interactions (row select, nav, filters, the calendar drag/resize) are **cosmetic — state-only, no persistence, no backend, no real timezone/conflict math.**
- **Isn't:** the production app. The real ETG platform is a private monorepo: **Next.js + shadcn/ui + tRPC + PostgreSQL (Prisma) + domain engines + BullMQ**. When you implement, you rebuild each screen there with shadcn + semantic tokens + tRPC — **do not port this prototype's inline-style JSX or its hand-rolled calendar.**
- ETG is a **"leakage & margin control"** field-services platform (CCTV / security / electrical / comms, AU). That's *why* so much is read-only: the numbers (margins, costs, invoice-readiness, health) are **computed by engines**, not typed by users.

## 2. The maturity tags — THE key thing to understand

The screens carry small tags that encode *what is real vs computed vs coming*. **They are scaffolding to mark intent — when you implement a screen for real, you REMOVE the tag and replace it with the real thing.** Never ship the tags.

| Tag (in the UI) | Means | What to do when implementing |
|---|---|---|
| **`Read-only`** (lock icon) | A value the **system/engine computes** — never a user input | Render read-only; compute it server-side. Never make it an editable field. |
| **`Upcoming`** (sparkles) | A **roadmap** capability not built yet | Leave it out / stub it now; build it in its later phase. It's intentionally non-functional here. |
| **`Preview`** (amber eye) | A **real concept whose data feed/source isn't wired yet** (rendered muted) | Wire it to the real data source when that source exists; then drop the tag. |
| **`—` / "Calculating…"** | An **engine output with no value yet** (the engine isn't live) | Show `—` until the engine ships; then show the computed value. |

If a value is tagged, **do not** turn it into a manual input or invent a number for it.

## 3. Conventions that ARE real — carry them through

These are not mock; they reflect the real platform and must be honored when you build:

- **IDs are `PREFIX-NNNNNN`** (auto-generated, never user-typed): `PRJ-` project, `FJ-` field job, `ST-` service ticket, `SD-` scheduled visit, `CC-` cost centre, `CLI-` client, `SITE-` site, `CON-` contact, `USR-` user/tech, `SI-` supplier invoice, `BTX-` bank txn, `IM-` invoice match, `EG-` asset. The structured chips with a lock icon = these IDs.
- **Timezone:** store every instant in **UTC**; display in the **site/job timezone** (e.g. "8:00 AM NSW time") with a muted viewer-local secondary line ("7:00 AM your time (QLD)") when they differ; company/head-office default is **Australia/Brisbane**. Calendar/finance views follow this. (In the demo this is illustrative; in the app it's load-bearing — use IANA zones, never raw offsets.)
- **Money:** integer cents, AU GST (internal ex-GST; bank inc-GST; split at invoice headers). Margins / gross profit / health / invoice-readiness / match-confidence are **engine-computed** (that's why they're `Read-only`/`Calculating`).
- **Design system:** semantic ETG tokens only (primary = action-blue `#1366D6`, deep navy = headers/rail, teal accent, the status palette, Inter, lucide, no emoji, en-AU spelling). Rebuild with shadcn primitives + token classes — not raw hex/markup.
- **Status & lifecycle** are moved by the workflow engine via action buttons ("Approve", "Confirm", "Convert to Job") — **not** by editing a status dropdown on a create form.

## 4. What's mock / cosmetic (don't mistake it for product behaviour)

- All data is **fake sample data**; counts/KPIs are illustrative.
- **Create forms** show the intended fields but don't persist; engine/derived fields on them are `Read-only`/`Calculating`, not inputs.
- The **single-worker calendar** (click a technician → their Day/Week calendar) and its **drag-to-move / drag-edges-to-resize / click-to-expand** are **hand-rolled and cosmetic** (snap-to-grid, no persistence, no real tz/conflict math). The real build should use a **calendar library** (e.g. FullCalendar `resourceTimeGrid`) wired to the scheduling data + the dispatch-scheduling gate engine + real UTC↔site-tz conversion.
- "Customer view" / portal, SLA timers, asset monitoring, auto-routing, bank-feed sync, OCR — all `Upcoming`/`Preview`: roadmap, not live.

## 5. Real-now vs planned (high level)

- **Backed by shipped backend (build these first):** Projects, Service Tickets (+ Create Ticket), Calendar, Invoice Matching (Reconciliation Stage 1).
- **Planned verticals (the `Upcoming`/`Preview` surfaces):** Client Assets (Asset entity), Timesheets/labour write-path, Reconciliation Stage 2, customer invoicing + invoice-readiness engine, the Quote vertical (Create Project becomes quote-fed), ChannelX comms, the customer portal/visibility tier.

## 6. The authoritative source

The canonical spec, schema, decisions, and the field-by-field "what's real vs engine vs not-built" analysis live in the **private `etg-monorepo`** (`context-files/design-intake/*`, `context-files/business-logic/schema-reference.md`, `context-files/engineering/*`). **If you're implementing, get those** — this demo is the visual target; the monorepo is the source of truth.
