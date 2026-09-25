# RepoThink Implementation Roadmap

## Milestone status

| Milestone | Goal | Status |
|---|---|---|
| M0 | Foundation & Product Extraction | ✅ Complete — acceptance criteria validated |
| M1 | Code Intelligence 2.0 | ⬜ Planned |
| M2 | Impact Intelligence | ⬜ Planned |
| M3 | Semantic Search & Context Engine | ⬜ Planned |
| M4 | Architecture Explorer | 🔵 In progress |
| M5 | Evidence-backed AI | ⬜ Planned |
| M6 | MCP / Agent Integration | ⬜ Planned |

## M0 — Foundation & Product Extraction

### Product and architecture
- [x] M0.01 Define product documentation
- [x] M0.02 Define product boundaries
- [x] M0.03 Define target architecture
- [x] M0.04 Define RepoMind → RepoThink migration map

### Intelligence migration
- [x] M0.05 Repository filesystem/index foundation
- [x] M0.06 Parser and AST foundation
- [x] M0.07 Symbols, definitions and references
- [x] M0.08 Dependency graph
- [x] M0.09 Health/analyzers
- [x] M0.10 Git intelligence
- [x] M0.11 IndexedDB/cache
- [x] M0.12 Reports/documentation
- [x] M0.13 Context Builder
- [x] M0.14 AI provider foundation

### Application
- [x] M0.15 Rebuild application shell
- [x] M0.16 Rebuild navigation
- [x] M0.17 Rebuild Codebase workspace
- [x] M0.18 Rebuild Overview
- [x] M0.19 Rebuild Explorer
- [x] M0.20 Rebuild Search
- [x] M0.21 Rebuild Editor

### Product cleanup
- [x] M0.22 Remove Developer Tools
- [x] M0.23 Remove Temenos/OFS functionality
- [x] M0.24 Remove Markdown utility workspace
- [x] M0.25 Remove Engineering utilities
- [x] M0.26 Remove obsolete Transform functionality
- [x] M0.27 Remove legacy Python/FastAPI backend
- [x] M0.28 Clean dependencies and scripts

### Quality
- [x] M0.29 Add intelligence fixtures/tests
- [x] M0.30 Establish CI baseline
- [x] M0.31 Refresh README and technical documentation
- [x] M0.32 Validate M0 acceptance criteria

## M1 — Code Intelligence 2.0

- [ ] M1.01 Symbol resolution
- [ ] M1.02 Definition/reference navigation
- [ ] M1.03 Call graph
- [ ] M1.04 Callers/callees
- [ ] M1.05 Test discovery
- [ ] M1.06 Dead-code signals
- [ ] M1.07 Duplicate-code signals
- [ ] M1.08 Complexity metrics
- [ ] M1.09 Confidence/evidence model
- [ ] M1.10 Intelligence regression suite

## M2 — Impact Intelligence

- [ ] M2.01 Changed-file analysis
- [ ] M2.02 Changed-symbol analysis
- [ ] M2.03 Reference propagation
- [ ] M2.04 Caller/dependent propagation
- [ ] M2.05 API impact
- [ ] M2.06 Test impact
- [ ] M2.07 Git-aware impact evidence
- [ ] M2.08 Impact report

## M3 — Semantic Search & Context Engine

- [ ] M3.01 Lexical search
- [ ] M3.02 AST/symbol search
- [ ] M3.03 Dependency-aware search
- [ ] M3.04 Semantic search
- [ ] M3.05 Hybrid ranking
- [ ] M3.06 Context selection
- [ ] M3.07 Token budgeting
- [ ] M3.08 Context quality evaluation

## M4 — Architecture Explorer

**Current slice:** file-level dependency architecture is now exposed as an interactive local graph with hotspots, cycles, connected-component metrics, filtering, and source-file navigation. Symbol/API/database/test graph layers remain part of the later M4 work.

- [ ] M4.01 System graph
- [ ] M4.02 Module graph
- [ ] M4.03 File/symbol graph
- [ ] M4.04 API graph
- [ ] M4.05 Database/external dependency graph
- [ ] M4.06 Test graph
- [ ] M4.07 Interactive graph explorer
- [ ] M4.08 Mermaid export/rendering

## M5 — Evidence-backed AI

- [ ] M5.01 Repository question workflow
- [ ] M5.02 Evidence retrieval
- [ ] M5.03 Graph traversal for AI context
- [ ] M5.04 Evidence-aware prompts
- [ ] M5.05 Citation model
- [ ] M5.06 Explain/analyze workflows
- [ ] M5.07 AI evaluation fixtures

## M6 — MCP / Agent Integration

- [ ] M6.01 repothink.search
- [ ] M6.02 repothink.symbol
- [ ] M6.03 repothink.definition
- [ ] M6.04 repothink.references
- [ ] M6.05 repothink.callers
- [ ] M6.06 repothink.callees
- [ ] M6.07 repothink.dependencies
- [ ] M6.08 repothink.impact
- [ ] M6.09 repothink.tests
- [ ] M6.10 repothink.architecture
- [ ] M6.11 repothink.context
- [ ] M6.12 repothink.health
- [ ] M6.13 repothink.explain

## M0 acceptance criteria

M0 is complete when:

1. RepoThink has a clean product identity and documented architecture.
2. Only repository-intelligence functionality remains.
3. Selected RepoMind intelligence capabilities are migrated into the new architecture.
4. No legacy Python/FastAPI Codebase Workbench remains.
5. Core navigation and workspace structure are functional.
6. Intelligence tests and CI provide a repeatable baseline.
7. The application can open/index a repository and expose its core intelligence without the removed utility workspaces.

## Implementation rule

RepoMind is a reference implementation, not a source tree to copy wholesale. Each migrated capability must be placed in the RepoThink architecture and simplified or redesigned where necessary.

### M0 completion validation

M0 cleanup was audited against the RepoThink product boundary. The legacy Codebase Workbench backend and the previously identified Developer Tools, Temenos/OFS, Markdown utility, Engineering utility, and Transform surfaces are absent from RepoThink. Intelligence fixtures now exercise indexing, symbol/export discovery, dependency resolution, unresolved-import detection, relationship traversal, and cycle detection. CI runs these tests before the production build.
