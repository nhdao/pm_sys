import { DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.entity";
import { Permission } from "src/permissions/entities/permission.entity";


@Entity()
export class RolePermission {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Role, (role) => role.rolePermissions)
  role: Role

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions)
  permission: Permission

  @DeleteDateColumn()
  deletedAt: Date
}
