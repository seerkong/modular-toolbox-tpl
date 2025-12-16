import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TableProfileEntity } from "./TableProfile";

@Entity({ name: "db_profiles" })
export class DbProfileEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", unique: true })
  name!: string;

  @Column({ type: "varchar" })
  host!: string;

  @Column({ type: "integer" })
  port!: number;

  @Column({ type: "varchar" })
  username!: string;

  @Column({ type: "varchar" })
  password!: string;

  @Column({ type: "varchar", default: "" })
  database!: string;

  @Column({ type: "boolean", default: false })
  active!: boolean;

  @OneToMany(() => TableProfileEntity, (tableProfile) => tableProfile.dbProfile, { cascade: ["remove"] })
  tableProfiles!: TableProfileEntity[];
}
