import { DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Technology } from "src/technologies/entities/technology.entity";
import { Project } from "./project.entity";

@Entity()
export class ProjectTech {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Project, (project) => project.projectTechs)
  project: Project

  @ManyToOne(() => Technology, (tech) => tech.projectTechs)
  tech: Technology

  @DeleteDateColumn()
  deletedAt: Date
}
