import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import type { PrepareValueListType } from "@app/shared";

@Entity({ name: "custom_value_lists" })
export class CustomValueListEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar" })
  valueType!: PrepareValueListType;

  @Column({ type: "simple-json" })
  values!: Array<string | number>;

  @Column({ type: "integer", default: 0 })
  itemCount!: number;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt!: Date;
}
