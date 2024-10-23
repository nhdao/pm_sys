import { RolePermission } from "src/roles/entities/role-permission.entity";
import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  method: string

  @Column()
  api_path: string

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
  rolePermissions: RolePermission[]

  @DeleteDateColumn()
  deletedAt: Date
}
