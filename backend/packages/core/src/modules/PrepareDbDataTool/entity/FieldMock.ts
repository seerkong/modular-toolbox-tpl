import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";
import type { PrepareMockKind } from "@app/shared";
import type { TableProfileEntity } from "./TableProfile";

@Entity({ name: "field_mocks" })
export class FieldMockEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  columnName!: string;

  @Column({ type: "varchar" })
  columnTypeKind!: "string" | "number";

  @Column({ type: "varchar" })
  kind!: PrepareMockKind;

  @Column({ type: "varchar" })
  type!: string;

  @Column({ type: "simple-json", nullable: true })
  extraConfig?: Record<string, unknown>;

  @Column({ type: "integer", default: 0 })
  orderIndex!: number;

  @ManyToOne("TableProfileEntity", { onDelete: "CASCADE" })
  tableProfile!: Relation<TableProfileEntity>;

  @Column({ type: "integer" })
  tableProfileId!: number;
}
