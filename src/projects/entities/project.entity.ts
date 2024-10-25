import { Client } from "src/clients/entities/client.entity";
import { Department } from "src/departments/entities/department.entity";
import { Task } from "src/tasks/entities/task.entity";
import { UserProject } from "src/users/entities/user-project.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProjectTech } from "./project-tech.entity";
import { EPrjStatus } from "src/constants/project-status";
import { EPrjType } from "src/constants/project-type.enum";
import { User } from "src/users/entities/user.entity";


@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  description: string

  @ManyToOne(() => Department, (department) => department.projects)
  department: Department

  @Column()
  budget: string

  @Column()
  type: EPrjType

  @Column({ default: EPrjStatus.INPROGESS })
  status: EPrjStatus

  @CreateDateColumn()
  created_date: Date

  @Column()
  start_date: Date

  @Column()
  due_date: Date

  @ManyToOne(() => User, (user) => user.managedProjects)
  manager: User 

  @ManyToOne(() => Client, (client) => client.projects)
  client: Client

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[]

  @OneToMany(() => UserProject, (userProject) => userProject.project)
  userProjects: UserProject[]

  @OneToMany(() => ProjectTech, (projectTech) => projectTech.project)
  projectTechs: ProjectTech[]

  @DeleteDateColumn()
  deletedAt: Date
}
