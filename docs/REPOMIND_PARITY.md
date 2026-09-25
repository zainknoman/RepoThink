# RepoMind → RepoThink Parity Upgrade

## Why this upgrade was needed

RepoThink had the right M1–M6 architecture, but several features were only represented by simplified implementations. RepoMind's mature Codebase workspace provided a clearer and more complete interaction model.

The comparison showed that RepoMind was not simply stronger because it had more features. Its existing features were connected end-to-end:

- one index backed the workspace;
- source text remained available after indexing;
- search could inspect both indexed metadata and actual source lines;
- analyzers produced inspectable findings with file/line navigation;
- API and security scanners reused the same source model;
- reports consumed the same intelligence;
- Context Builder emitted actual source, not only filenames;
- AI received the selected repository evidence;
- diagrams could be rendered, re-rendered, copied and downloaded;
- cached indexes rehydrated symbol relationships.

RepoThink had several of these concepts, but some were placeholders, disconnected, or only partially functional.

## Key gaps found

| Area | RepoMind behavior | RepoThink before upgrade | Upgrade |
|---|---|---|---|
| Codebase UX | One clear intelligence workspace | Split Codebase + Intelligence workspaces | Unified Codebase workspace |
| Search | Indexed + full source search | Metadata/token overlap only | Indexed + source + hybrid search |
| API discovery | Express/Nest/FastAPI/Flask/Spring/ASP.NET | Missing from unified workspace | Restored |
| Security | Heuristic secret/credential scanner | Missing from unified workspace | Restored |
| Framework analyzers | Registry + route + structure + resolution + hotspots | Minimal M1 analyzer concepts | Restored analyzer registry |
| Reports | Project + module reports | Basic report | Expanded project/module reporting |
| Context | Actual source context with dependencies/dependents | Cache/source contract mismatch | Fixed |
| AI | Provider settings + actual selected context | Evidence prompt mostly contained filenames | AI now receives repository source evidence |
| Diagrams | Mermaid rendering with loading/error/re-render/copy/download | Mermaid export only | Browser renderer restored |
| Packages | Package/framework profile | Basic framework signals | Package detection restored |
| Navigation | Search/analyzer findings open source | Partial | Unified workspace navigation |
| Cache | Rehydrates relationships | Serialization existed but needed reliable source/context behavior | Context and relationship flow hardened |

## Architectural decision

RepoMind is the reference implementation for proven behavior, not a branch to copy wholesale.

RepoThink remains the long-term architecture:

Repository → Index → Code Intelligence → Search → Context → Architecture → Impact → Evidence → AI → MCP

RepoMind-grade functionality is being integrated into that architecture as reusable intelligence services rather than recreating RepoMind's old monolithic service boundaries.

## Current unified Codebase workspace

The Codebase workspace now provides:

1. Overview
2. Search
3. Symbols
4. Architecture
5. Health
6. Analyzers
7. Impact
8. API Discovery
9. Security
10. Diagram
11. Reports
12. Context Builder
13. AI Workspace
14. M1 Signals
15. MCP

## Important behavior

### Search

Search now has three evidence levels:

- indexed symbol/file/dependency matches;
- exact source-line matches;
- hybrid ranking across both.

### Context

Context Builder uses indexed source directly and expands selected files through dependencies and dependents. It no longer depends exclusively on live FileSystem handles after indexing.

### AI

Evidence-backed AI now receives:

- the user's question;
- evidence IDs;
- file paths and line numbers;
- actual selected source;
- selected dependency/dependent context.

The AI instruction explicitly requires evidence-backed answers and allows the model to say that evidence is insufficient.

### Security

Security scanning is intentionally heuristic. Findings are navigable to the source line and are not presented as definitive vulnerability proof.

### API discovery

Route discovery covers common patterns for Express, NestJS, FastAPI, Flask, Spring and ASP.NET.

### Diagrams

Mermaid remains an optional browser renderer. Repository analysis does not depend on Mermaid being available.

## Validation

The parity regression suite covers:

- indexed/source/hybrid search;
- API discovery;
- security scanning;
- analyzer execution;
- documentation generation;
- context selection.

The existing M1–M6 tests remain in place.

## Result

RepoThink is now the primary product architecture, while RepoMind's clearer and already-proven workflows have been restored where they materially improve functionality and user experience.