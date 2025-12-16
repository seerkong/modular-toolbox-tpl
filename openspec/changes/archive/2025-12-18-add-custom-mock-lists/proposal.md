# Change: Add custom mock lists for PrepareDbDataTool

## Why
SequenceIn/RandomIn field mocks are limited to fixed built-in lists, forcing code edits whenever we need custom values. Users want to import reusable string/number lists from CSV and pick them in the UI without hard-coding.

## What Changes
- Add a new PrepareDbDataTool menu view to upload CSV files as named string/number lists, persist them in the module database, and manage the saved entries.
- Expose APIs/contracts for listing, creating, and deleting custom lists; wire mock generation to consume the selected list for SequenceIn/RandomIn.
- Extend schema field configuration so SequenceIn/RandomIn type dropdowns include saved custom lists (filtered by column type) and persist selections in table profiles across Vue/React shells.

## Impact
- Affected specs: prepare-db-data-tool
- Affected code: shared contracts/types, backend core entities + services + endpoints, frontend core API/controller, Vue/React PrepareDbDataTool views and routing, tests for mock generation and profile persistence
