# RepoThink Implementation Roadmap

## Milestone status

| Milestone | Goal | Status |
|---|---|---|
| M0 | Foundation & Product Extraction | ✅ Complete — acceptance criteria validated |
| M1 | Code Intelligence 2.0 | ✅ Complete |
| M2 | Impact Intelligence | ✅ Complete |
| M3 | Semantic Search & Context Engine | ✅ Complete |
| M4 | Architecture Explorer | ✅ Complete |
| M5 | Evidence-backed AI | ✅ Complete |
| M6 | MCP / Agent Integration | ✅ Complete |

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

- [x] M1.01 Symbol resolution
- [x] M1.02 Definition/reference navigation
- [x] M1.03 Call graph
- [x] M1.04 Callers/callees
- [x] M1.05 Test discovery
- [x] M1.06 Dead-code signals
- [x] M1.07 Duplicate-code signals
- [x] M1.08 Complexity metrics
- [x] M1.09 Confidence/evidence model
- [x] M1.10 Intelligence regression suite

## M2 — Impact Intelligence

- [x] M2.01 Changed-file analysis
- [x] M2.02 Changed-symbol analysis
- [x] M2.03 Reference propagation
- [x] M2.04 Caller/dependent propagation
- [x] M2.05 API impact
- [x] M2.06 Test impact
- [x] M2.07 Git-aware impact evidence
- [x] M2.08 Impact report

## M3 — Semantic Search & Context Engine

- [x] M3.01 Lexical search
- [x] M3.02 AST/symbol search
- [x] M3.03 Dependency-aware search
- [x] M3.04 Semantic search
- [x] M3.05 Hybrid ranking
- [x] M3.06 Context selection
- [x] M3.07 Token budgeting
- [x] M3.08 Context quality evaluation

## M4 — Architecture Explorer

**Completed:** system/module/file/symbol/API/external/test graph layers, interactive architecture model, Mermaid export, hotspots and cycles are available through the Intelligence Studio.

- [x] M4.01 System graph
- [x] M4.02 Module graph
- [x] M4.03 File/symbol graph
- [x] M4.04 API graph
- [x] M4.05 Database/external dependency graph
- [x] M4.06 Test graph
- [x] M4.07 Interactive graph explorer
- [x] M4.08 Mermaid export/rendering

## M5 — Evidence-backed AI

- [x] M5.01 Repository question workflow
- [x] M5.02 Evidence retrieval
- [x] M5.03 Graph traversal for AI context
- [x] M5.04 Evidence-aware prompts
- [x] M5.05 Citation model
- [x] M5.06 Explain/analyze workflows
- [x] M5.07 AI evaluation fixtures

## M6 — MCP / Agent Integration

- [x] M6.01 repothink.search
- [x] M6.02 repothink.symbol
- [x] M6.03 repothink.definition
- [x] M6.04 repothink.references
- [x] M6.05 repothink.callers
- [x] M6.06 repothink.callees
- [x] M6.07 repothink.dependencies
- [x] M6.08 repothink.impact
- [x] M6.09 repothink.tests
- [x] M6.10 repothink.architecture
- [x] M6.11 repothink.context
- [x] M6.12 repothink.health
- [x] M6.13 repothink.explain

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
\n### M1–M6 completion validation\n\nM1–M6 are implemented as a unified intelligence layer. M1 adds symbol/call/test/dead-code/duplicate/complexity/evidence signals; M2 adds local baseline change and impact analysis; M3 adds hybrid retrieval and context selection; M4 adds system/module/symbol/API/external/test architecture and Mermaid export; M5 adds evidence retrieval and optional provider-backed answers; M6 adds an MCP-compatible browser adapter plus a dependency-free local stdio server.\n