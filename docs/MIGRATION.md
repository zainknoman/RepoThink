# RepoMind → RepoThink Migration Map

RepoMind is the predecessor and reference implementation. RepoThink will selectively migrate capabilities rather than copy the repository wholesale.

| RepoMind capability | RepoThink destination | Action |
|---|---|---|
| repository.js filesystem/index | infrastructure + intelligence/index | Refactor |
| Babel AST parsing | intelligence/parser | Migrate/refactor |
| symbols/references | intelligence/symbols | Migrate/refactor |
| dependency graph | intelligence/dependencies | Migrate/refactor |
| health.js | intelligence/health | Migrate/refactor |
| analyzers.js | intelligence/analyzers | Migrate/refactor |
| git.js | infrastructure/git + features/git | Migrate/refactor |
| indexCache.js | infrastructure/cache | Migrate/refactor |
| documentation.js | features/reports | Migrate/refactor |
| Context Builder | features/context + ai/context | Redesign |
| ai.js providers | ai/providers | Redesign |
| diagram.js | features/architecture | Refactor |
| intelligence.js | split across intelligence/* | Rewrite |
| App.jsx | app/* | Rewrite |
| CodebasePanel.jsx | features/codebase/* | Rewrite |
| legacy backend/app | — | Remove |

## RepoMind features intentionally excluded

- Developer Tools
- generic text/encoding utilities
- Temenos/OFS tooling
- standalone Markdown tooling
- legacy Codebase Workbench backend

## Migration order

1. Foundation and product boundaries
2. Repository/index/parser
3. Symbols/references/dependencies
4. Health/analyzers/Git/cache
5. Application shell and workspaces
6. Reports/context/AI foundation
7. Cleanup and dependency reduction
8. Tests and CI validation
