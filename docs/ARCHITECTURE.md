# RepoThink Target Architecture

## Product definition

RepoThink is a local-first codebase intelligence workspace that helps developers understand, navigate, analyze, and reason about unfamiliar software systems.

## Application layers

```
frontend/src/
├── app/
│   ├── App.jsx
│   ├── navigation.js
│   ├── routes.js
│   └── workspace.js
├── features/
│   ├── overview/
│   ├── explorer/
│   ├── search/
│   ├── editor/
│   ├── codebase/
│   ├── architecture/
│   ├── impact/
│   ├── git/
│   ├── reports/
│   ├── context/
│   └── ai/
├── intelligence/
│   ├── parser/
│   ├── index/
│   ├── symbols/
│   ├── dependencies/
│   ├── callgraph/
│   ├── impact/
│   ├── architecture/
│   ├── health/
│   ├── analyzers/
│   └── tests/
├── ai/
│   ├── providers/
│   ├── context/
│   ├── prompts/
│   ├── evidence/
│   └── citations/
├── infrastructure/
│   ├── filesystem/
│   ├── cache/
│   └── git/
└── shared/
    ├── components/
    ├── hooks/
    ├── constants/
    └── utils/
```

## Navigation

### Workspace
- Overview
- Explorer
- Search
- Editor

### Intelligence
- Codebase
- Architecture
- Impact
- Health
- Git

### Understand
- Context
- Reports
- AI

## Codebase workspace

- Overview
- Files
- Symbols
- References
- Dependencies
- APIs
- Security
- Analyzers

## Migration principles

### Migrate
- filesystem/repository access
- AST parsing
- symbols and references
- dependencies
- impact foundations
- architecture intelligence
- health analysis
- API discovery
- security heuristics
- framework analyzers
- Git intelligence
- context builder
- reports
- AI provider foundation
- IndexedDB cache
- Mermaid rendering/export

### Remove
- Developer Tools
- JSON formatter
- Text Cleanup
- Base64
- Regex
- JWT Decoder
- UUID
- Timestamp
- Temenos workspace
- OFS Generator
- T24 Log Analyzer
- standalone Markdown workspace
- generic Engineering utilities
- legacy FastAPI/Codebase Workbench backend

### Reframe
- Ingest → Repository Context
- Compare → Changes / Impact
- Transform → Context Builder concepts only

## Design rule

RepoThink should be structurally smaller and conceptually clearer than RepoMind. Intelligence is the product; generic utilities are not.
