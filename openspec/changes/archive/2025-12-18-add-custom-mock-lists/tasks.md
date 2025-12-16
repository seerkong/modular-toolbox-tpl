## 1. Shared + Backend
- [x] 1.1 Extend shared contracts/DTOs for custom value lists and wire field configs to reference a chosen list.
- [x] 1.2 Add SQLite entity/repository for custom lists with CSV import (string/number), including API endpoints to create/list/delete.
- [x] 1.3 Update mock generation/validation to resolve SequenceIn/RandomIn values from saved lists and cover error handling.
- [x] 1.4 Add backend unit/integration tests for list import, persistence, and generation using custom lists.

## 2. Frontend Core + Mediator
- [x] 2.1 Extend core API/controller to call custom list endpoints and surface options to shells.
- [x] 2.2 Update schema field config state so SequenceIn/RandomIn dropdowns merge built-ins with custom lists by type and persist selections.
- [x] 2.3 Add custom list management view (CSV upload + list + delete) and menu entry for PrepareDbDataTool in Vue/React shells.
- [x] 2.4 Add frontend unit tests covering API/controller wiring and UI validation for upload + selection.

## 3. Validation
- [x] 3.1 Run/extend automated tests for affected layers.
- [x] 3.2 Manual sanity: import string/number CSV, assign to SequenceIn/RandomIn fields, preview insert first batch, and verify generated values come from the chosen list.
