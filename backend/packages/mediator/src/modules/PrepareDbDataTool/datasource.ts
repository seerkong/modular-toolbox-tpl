import "reflect-metadata";
import { DataSource } from "typeorm";
import { DbProfileEntity, TableProfileEntity, FieldMockEntity, CustomValueListEntity } from "@backend/core";

export const createPrepareDbDataDataSource = (database: string) =>
  new DataSource({
    type: "sqlite",
    database,
    synchronize: true,
    entities: [DbProfileEntity, TableProfileEntity, FieldMockEntity, CustomValueListEntity],
    logging: false,
  });
