import { Project } from "src/projects/entities/project.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  description: string

  @ManyToOne(() => User, (user) => user.assignedTasks)
  user: User

  @ManyToOne(() => User, (user) => user.managedTasks)
  manager: User

  @ManyToOne(() => Project, (project) => project.tasks)
  project: Project

  @CreateDateColumn()
  assigned_date: Date

  @Column()
  deadline: Date

  @Column({ default: false })
  done: boolean
  
  @DeleteDateColumn()
  deletedAt: Date
}
