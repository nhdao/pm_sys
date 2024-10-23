import { Project } from "src/projects/entities/project.entity";
import { DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserProject {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, (user) => user.userProjects)
  user: User

  @ManyToOne(() => Project, (project) => project.userProjects)
  project: Project

  @DeleteDateColumn()
  deletedAt: Date
}
