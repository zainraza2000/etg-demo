# ETG Dashboard — Design Demo

A live, interactive prototype of the **ETG Dashboard** (*"Leakage & Margin Control"*) — designed in [Claude Design](https://claude.ai/design) and exported as a static UI kit.

**▶ Live demo:** https://zainraza2000.github.io/etg-demo/

> **Implementing from this demo? Read [`AGENTS.md`](./AGENTS.md) first** — it explains what's real vs mock, what the on-screen `Upcoming`/`Preview`/`Read-only` tags mean (and what to do with them), the ID/timezone/money conventions, and where the authoritative spec lives. Don't treat this prototype as a spec without it.

## What this is

A **static, build-free** React prototype — React (UMD) + in-browser Babel + lucide icons + Google Fonts, all from CDN. No backend, no bundler. It uses sample data and cosmetic interactions (row select, nav). It opens on the **Dashboard**; use the left rail to switch screens:

**Dashboard · Projects · Service Tickets · Client Assets · Calendar · Timesheets · Reconciliation · Invoice Matching · Create Ticket · Create Project**

You can deep-link a screen with `?screen=tickets`, `?screen=calendar`, etc.

### Technician Portal (mobile)

A second surface — the **field-worker view** — lives at [`technician-portal.html`](./technician-portal.html), rendered inside an on-screen phone frame. It's scoped to one technician: today's jobs, the clock-on/off → travel → arrive → checklist/photos/sign-off → clock-off lifecycle, materials capture and timesheet submit, with **all financials hidden**. Open it from the **Technician Portal** button in the top bar; a link in its header returns you to the Dashboard.

In the real platform this is the *same login rendered by device/role* (a responsive web app, not a separate native app) — the demo just gives it its own page and phone frame so you can see it on desktop. It is **not** an item in the admin sidebar.

The maturity tags on the screens are intentional, reflecting the real platform:
- **Upcoming** — roadmap capability, not live yet
- **Preview** — a real concept whose data feed isn't wired yet (shown muted)
- **Read-only** / **—** — a value the system/engine computes (never a manual input)

## Not the product

This is a **design demo only**. The real ETG application lives in the private `etg-monorepo` (Next.js → Vercel) and shares this design system's tokens.

## Refresh

The source of truth is `etg-monorepo/.agents/skills/etg-design/ui_kits/dashboard/`. To update this demo after the design changes, run [`./publish.sh`](./publish.sh) — it re-copies the kit and pushes; GitHub Pages rebuilds in ~1 minute.
