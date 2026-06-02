# ETG Dashboard — Design Demo

A live, interactive prototype of the **ETG Dashboard** (*"Leakage & Margin Control"*) — designed in [Claude Design](https://claude.ai/design) and exported as a static UI kit.

**▶ Live demo:** https://zainraza2000.github.io/etg-demo/

> **Implementing from this demo? Read [`AGENTS.md`](./AGENTS.md) first** — it explains what's real vs mock, what the on-screen `Upcoming`/`Preview`/`Read-only` tags mean (and what to do with them), the ID/timezone/money conventions, and where the authoritative spec lives. Don't treat this prototype as a spec without it.

## What this is

A **static, build-free** React prototype — React (UMD) + in-browser Babel + lucide icons + Google Fonts, all from CDN. No backend, no bundler. It uses sample data and cosmetic interactions (row select, nav). Use the left rail to switch screens:

**Projects · Service Tickets · Client Assets · Calendar · Timesheets · Reconciliation · Invoice Matching · Create Ticket · Create Project**

The maturity tags on the screens are intentional, reflecting the real platform:
- **Upcoming** — roadmap capability, not live yet
- **Preview** — a real concept whose data feed isn't wired yet (shown muted)
- **Read-only** / **—** — a value the system/engine computes (never a manual input)

## Not the product

This is a **design demo only**. The real ETG application lives in the private `etg-monorepo` (Next.js → Vercel) and shares this design system's tokens.

## Refresh

The source of truth is `etg-monorepo/.agents/skills/etg-design/ui_kits/dashboard/`. To update this demo after the design changes, run [`./publish.sh`](./publish.sh) — it re-copies the kit and pushes; GitHub Pages rebuilds in ~1 minute.
