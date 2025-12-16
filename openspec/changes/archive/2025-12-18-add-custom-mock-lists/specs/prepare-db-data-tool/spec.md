## ADDED Requirements
### Requirement: Manage custom mock value lists
PrepareDbDataTool SHALL let users create, view, and delete named custom value lists (string or number) imported from CSV so they can be reused across table profiles.

#### Scenario: Import list from CSV
- **WHEN** the user opens the PrepareDbDataTool "自定义列表" view in either shell, selects list type (string/number), provides a name, and uploads a single-column CSV with values
- **THEN** the system parses the first column (skipping empty rows and optional header), rejects invalid number rows, persists the list in SQLite with item count, and shows the saved entry in the list.

#### Scenario: List and delete saved lists
- **WHEN** the custom list view loads or after a new list is saved
- **THEN** existing lists display with name, type, and item count, and the user can delete a list to remove it from SQLite and from subsequent field dropdown options.

#### Scenario: Guard against empty/invalid import
- **WHEN** the uploaded CSV has no valid rows or contains non-numeric values for a number list
- **THEN** the system surfaces a validation error and does not create the list.

### Requirement: Use custom lists in field configuration
Field mock configuration SHALL allow SequenceIn/RandomIn kinds to reference saved custom lists filtered by column type, and preserve the selection in table profiles.

#### Scenario: Select custom string list
- **WHEN** editing a string-classified column and choosing SequenceIn or RandomIn
- **THEN** the Type dropdown includes both built-in options and saved string lists (labeled by name), and saving/re-opening the profile keeps the chosen custom list.

#### Scenario: Select custom number list
- **WHEN** editing a number-classified column and choosing SequenceIn or RandomIn
- **THEN** the Type dropdown includes the built-in number list and saved number lists, and saved profiles restore the selected custom list when applied to matching schemas.

### Requirement: Generate values from custom lists
Preview and execute flows SHALL generate SequenceIn/RandomIn values from the selected custom list and fail fast with clear errors when the referenced list is missing.

#### Scenario: Generate from saved list or fail clearly
- **WHEN** a field uses SequenceIn/RandomIn with a custom list and preview/execute runs
- **THEN** values come from the saved list (cycling sequentially or randomly as chosen), and if the list is missing or empty the operation returns a descriptive error instead of inserting rows.

## MODIFIED Requirements
### Requirement: Provide mock options per field type
Field configuration SHALL expose the defined mock kinds/types for string and number columns with correct generation semantics, including saved custom lists.

#### Scenario: Present string mock options
- **WHEN** editing a string-classified field
- **THEN** the user can choose one kind/type from `IdGenerator:{ULID,UUID,SnowflakeId}`, `SequenceIn:{BuiltinPersonList,BuiltinDepartmentList,<custom string lists>}`, `RandomIn:{BuiltinPersonList,BuiltinDepartmentList,<custom string lists>}`, or `Default:{DbDefault,Null}`.

#### Scenario: Present number mock options
- **WHEN** editing a number-classified field
- **THEN** the user can choose one kind/type from `IdGenerator:{AutoIncrement,SnowflakeId}`, `SequenceIn:{BuiltinNumIdList,<custom number lists>}`, `RandomIn:{BuiltinNumIdList,<custom number lists>}`, `TimeGenerator:{TimestampSeconds,TimestampMillis}`, or `Default:{DbDefault,Null,const_0,const_1}`.
