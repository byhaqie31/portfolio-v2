# CLAUDE.md — portfolio-v2

This file is loaded automatically at the start of every Claude Code session in this repo. It is the entry point — keep it short and point at deeper docs rather than duplicating their content.

---

## Read first, every session

Before acting on any task in this repo, read the docs under [docs/](docs/). They are the source of truth — this file does **not** restate them.

| Doc | Read when… |
|---|---|
| [docs/STACK.md](docs/STACK.md) | The task touches dependencies, runtime, server/API, DB, Docker, env vars, or the local dev loop. |
| [docs/STRUCTURE.md](docs/STRUCTURE.md) | The task touches folder layout, where a new file should live, or how routes / components / composables / API endpoints map to disk. |
| [docs/UI-Standards.md](docs/UI-Standards.md) | The task touches anything visual — components, theme tokens, typography, spacing, motion, accessibility, or the admin/public UI. **Always read this before writing or editing UI code.** |

If a docs file contradicts something you observe in the code, trust the code and update the docs in the same change. Standards drift silently kills the design system — don't let it.

---

## Operating rules

- **Stack is closed.** Do not add Pinia, axios, a second icon set, or a second CSS framework. If you think a new dep is needed, propose it before installing.
- **Static-first data flow.** Every section reads `data/index.ts` as fallback and the DB as overlay (see [docs/STACK.md §5](docs/STACK.md#5-data-flow--static-first)). New fields land in `data/index.ts` and the schema in the same PR.
- **Design system over one-offs.** Use `.btn`, `.card`, `<UiSectionHeading>`, etc. Don't hand-roll button or card styling. New tokens / variants go in `assets/css/main.css`, not inline.
- **Auto-import path prefix.** `components/ui/Foo.vue` → `<UiFoo />`. Don't manually import.
- **`<script setup lang="ts">`** only. No `defineComponent`. No Options API. Reach for `@vueuse/core` before writing a new composable.
- **Nitro convention.** Server handlers are `verb.ts` / `[param].verb.ts`. One shared `mysql2` pool from `server/utils/db.ts` — never instantiate per-handler.
- **Secrets** come from env. Never commit `.env`.

---

## Workflow expectations

- **State-changing terminal commands** (git push, docker compose up, gh api PUT, ssh-keygen, brew, etc.) — present the exact command in a fenced block for Qie to run himself. Read-only diagnostics (`ls`, `git status`, `docker ps`, `gh repo view`) are fine to run via Bash.
- **File edits** in this repo are fine via Edit/Write — Qie reviews the diff.
- **PRs**: keep them focused. If a task forces a stack rule or UI standard to bend, update the relevant `docs/` file in the same PR.

---

## Project context

- Public site: `qie.dev` / `baihaqie.com`
- Visual language: **Axelnova Cyberpunk** (cyan / rose / green on near-black, scanlines, starfield, mono eyebrows)
- Two surfaces: public landing (`pages/index.vue`) and admin dashboard (`pages/admin/*`)
- Feedback collection: tokenized one-shot at `pages/feedback/[token].vue`
- DB lives in the shared `axelnova-infra` stack on the `axelnova-shared` Docker network — not in this repo's compose file.
