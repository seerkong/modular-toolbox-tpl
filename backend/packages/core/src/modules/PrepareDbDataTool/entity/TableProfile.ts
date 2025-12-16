import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";
import { FieldMockEntity } from "./FieldMock";
import type { DbProfileEntity } from "./DbProfile";

@Entity({ name: "table_profiles" })
export class TableProfileEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", default: "" })
  profileName!: string;

  @Column({ type: "varchar" })
  tableName!: string;

  @Column({ type: "simple-json" })
  columnSummaries!: Record<string, "string" | "number">;

  @ManyToOne("DbProfileEntity", { onDelete: "CASCADE" })
  dbProfile!: Relation<DbProfileEntity>;

  @Column({ type: "integer" })
  dbProfileId!: number;

  @OneToMany(() => FieldMockEntity, (field) => field.tableProfile, { cascade: true })
  fields!: FieldMockEntity[];

  @Column({ type: "boolean", default: false })
  isComplete!: boolean;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
