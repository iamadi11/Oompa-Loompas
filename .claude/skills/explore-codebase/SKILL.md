---
name: explore-codebase
description: Navigate and understand codebase structure using search tools
---

## Explore Codebase

Use Grep and Glob to explore and understand the codebase.

### Steps

1. Read `graphify-out/GRAPH_REPORT.md` for god nodes and community structure overview.
2. Use `Glob` with patterns like `apps/api/**/*.ts` or `packages/types/**/*.ts` to find files by module.
3. Use `Grep` to find specific functions, classes, or patterns across the codebase.
4. Read key files to understand contracts and interfaces.
5. Use `Grep` with `callers_of`-style patterns (search for function name) to trace relationships.

### Tips

- Start from `graphify-out/GRAPH_REPORT.md` communities to know which module owns what.
- Grep for symbol name before reading whole files.
- Use `output_mode: files_with_matches` first, then read only relevant files.
