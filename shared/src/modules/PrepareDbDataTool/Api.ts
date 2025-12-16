export enum PrepareDbDataToolApi {
  ListDbProfiles = "/api/prepare-db-data/db-profiles",
  DbProfileById = "/api/prepare-db-data/db-profiles/:id",
  ActivateDbProfile = "/api/prepare-db-data/db-profiles/:id/activate",
  TestDbProfile = "/api/prepare-db-data/db-profiles/test",

  FetchSchema = "/api/prepare-db-data/schema",

  ListTableProfiles = "/api/prepare-db-data/table-profiles",
  TableProfileById = "/api/prepare-db-data/table-profiles/:id",
  SaveTableProfile = "/api/prepare-db-data/table-profiles/save",
  TableProfileDetail = "/api/prepare-db-data/table-profiles/detail",
  ApplyTableProfile = "/api/prepare-db-data/table-profiles/apply",

  ListCustomValueLists = "/api/prepare-db-data/custom-lists",
  CreateCustomValueList = "/api/prepare-db-data/custom-lists",
  DeleteCustomValueList = "/api/prepare-db-data/custom-lists/:id",

  PreviewInsert = "/api/prepare-db-data/preview",
  ExecuteInsert = "/api/prepare-db-data/execute",
  CancelInsert = "/api/prepare-db-data/execute/:id/cancel",
  TaskStatus = "/api/prepare-db-data/tasks/:id",
}

export const PrepareDbDataToolWsPath = "/ws/PrepareDbDataTool/ImportStatus";
