# RepoThink Product Definition

## Purpose

RepoThink is a local-first codebase intelligence workspace for developers who need to understand, navigate, analyze, and reason about unfamiliar software systems.

## Core journey

Open Repository → Index → Understand → Search → Explore → Analyze → Trace → Assess Impact → Ask AI → Generate Context / Documentation

## Primary capabilities

- Open a repository from the local filesystem.
- Build a structural repository index.
- Discover files, languages, symbols, references, imports, exports, and internal dependencies.
- Navigate source files through Explorer and Search.
- Inspect source in a read-only Editor.
- Analyze architecture, health, Git metadata, context, reports, and AI provider configuration.
- Keep repository content local unless the user explicitly selects context for an external AI workflow.

## Product boundaries

RepoThink is not a generic developer utility toolbox. It excludes standalone encoding/formatting utilities, Temenos/OFS tools, markdown utilities, and the legacy Codebase Workbench backend.

## Design principles

1. Local-first by default.
2. Evidence before inference.
3. Structural intelligence is the foundation.
4. Every future AI workflow should be grounded in repository evidence.
5. Features belong in the intelligence journey, not as unrelated utility screens.
6. RepoMind is a reference implementation, not a source tree to copy wholesale.
