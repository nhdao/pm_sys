import { Project } from "src/projects/entities/project.entity";
import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  description: string

  @OneToMany(() => Project, (project) => project.client)
  projects: Project[]

  @DeleteDateColumn()
  deletedAt: Date
}
