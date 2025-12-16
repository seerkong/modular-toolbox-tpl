## Context
PrepareDbDataTool only exposes fixed built-in lists for SequenceIn/RandomIn mocks. Users need to import arbitrary string/number lists (from CSV) and reuse them when configuring table profiles without editing source code. The tool spans shared contracts, backend SQLite storage/typeORM, and Vue/React shells, so we need a small cross-layer design.

## Goals / Non-Goals
- Goals: persist named custom value lists (string/number), import from CSV, manage them via UI + APIs, expose them in SequenceIn/RandomIn dropdowns, and generate preview/execute values from the selected list.
- Non-Goals: advanced transformations (multi-column CSV, data cleaning), bulk editing of list items in UI, or changing other mock kinds.

## Decisions
- Storage: add a `CustomValueList` SQLite entity with `id`, `name`, `valueType` ("string"/"number"), `values` (simple-json), and timestamps; delete cascades should clean references via validation on use.
- CSV import: accept a single-column CSV; ignore an optional header row; trim whitespace; drop empty lines; for number lists, reject rows that cannot parse to finite numbers.
- Field reference: keep `kind` = SequenceIn/RandomIn with `type` = "CustomList" and record `listId` (and optional display name) in `extraConfig` so existing schema persists; applying profiles reuses the stored list id.
- Generation: resolve the list values by `listId` at preview/execute time; SequenceIn cycles deterministically, RandomIn samples randomly; raise a clear error if the referenced list is missing or empty.
- UI: add a new "自定义列表" view under PrepareDbDataTool in both shells with CSV upload + list/delete; schema field dropdowns include saved lists filtered by `valueType`.

## Risks / Trade-offs
- Large CSVs stored as JSON may increase SQLite row size; mitigate with basic size guardrails and keeping values trimmed.
- Deleting lists that are referenced by saved profiles will cause preview/execute failures; error messaging must be explicit.

## Migration Plan
- Add entity/repo and API endpoints.
- Wire core API/controller, then add UI for upload/list and dropdown integration.
- Update generation logic/tests for custom lists.
- Manual sanity with sample CSVs before release.

## Open Questions
- Do we need a maximum list length/file size limit beyond basic validation? (default to a reasonable cap if unspecified)
