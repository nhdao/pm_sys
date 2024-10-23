import { ProjectTech } from "src/projects/entities/project-tech.entity";
import { UserTech } from "src/users/entities/user-tech.entity";
import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Technology {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @OneToMany(() => UserTech, (userTech) => userTech.tech)
  userTechs: UserTech[]

  @OneToMany(() => ProjectTech, (projectTech) => projectTech.tech)
  projectTechs: ProjectTech[]

  @DeleteDateColumn()
  deletedAt: Date
}
