# RepoThink

RepoThink is a local-first codebase intelligence workspace for understanding, navigating, analyzing, and reasoning about unfamiliar software systems.

## Product journey

Open Repository → Index → Understand → Search → Explore → Analyze → Trace → Assess Impact → Ask AI → Generate Context / Documentation

## Roadmap

- [x] M0 — Foundation & Product Extraction
- [ ] M1 — Code Intelligence 2.0
- [ ] M2 — Impact Intelligence
- [ ] M3 — Semantic Search & Context Engine
- [ ] M4 — Architecture Explorer
- [ ] M5 — Evidence-backed AI
- [ ] M6 — MCP / Agent Integration

See `docs/ROADMAP.md` for the implementation tracker and `docs/ARCHITECTURE.md` for the target architecture.

## CI and GitHub Pages

RepoThink includes `.github/workflows/CI.yml` for frontend build verification and automatic GitHub Pages deployment from `main`. Enable **Settings → Pages → Source: GitHub Actions** once for the repository; subsequent pushes to `main` deploy automatically.

The current architecture includes local Git metadata, IndexedDB index caching, repository reports, context building, local AI provider configuration, an interactive file-level architecture graph, and automated intelligence regression tests.

## Product boundaries

RepoThink focuses on repository intelligence. It intentionally does not include generic developer utilities, Temenos/OFS tools, standalone markdown utilities, or the legacy Codebase Workbench backend from RepoMind.

## Predecessor

RepoMind is the reference implementation for selected intelligence capabilities. RepoThink is a redesign, not a wholesale copy.

## Current status

M0 is complete and validated. The next planned milestone is M1 — Code Intelligence 2.0. M4 has an active file-level dependency-graph slice; its remaining symbol/API/database/test graph layers are still planned.
