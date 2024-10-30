import { Department } from "src/departments/entities/department.entity";
import { Task } from "src/tasks/entities/task.entity";
import { Column, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserProject } from "./user-project.entity";
import { UserTech } from "./user-tech.entity";
import { Role } from "src/roles/entities/role.entity";
import { Project } from "src/projects/entities/project.entity";
import { EGender } from "src/constants/gender.enum";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  email: string

  @Column()
  password: string

  @Column({ nullable: true, default: null })
  avatar: string

  @Column()
  phone: string

  @Column()
  firstname: string

  @Column()
  lastname: string

  @Column()
  gender: EGender 

  @Column()
  dob: Date

  @Column()
  address: string

  @Column()
  identity: string

  @Column()
  yoe: number

  @Column()
  language: string

  @Column()
  cert: string
  
  @Column({ default: false })
  approved: boolean

  @Column({ nullable: true, default: null })
  passwordResetToken: string

  @Column({ nullable: true, default: null })
  passwordResetExpiration: Date

  @Column({ nullable: true, default: null })
  passwordChangedAt: Date

  @ManyToOne(() => Role)
  role: Role

  @ManyToOne(() => Department)
  department: Department

  @OneToMany(() => Department, (department) => department.users)
  assignedTasks: Task[]

  @OneToMany(() => Task, (task) => task.user)
  managedTasks: Task[]

  @OneToMany(() => Project, (project) => project.manager)
  managedProjects: Project[]

  @OneToMany(() => UserProject, (userProject) => userProject.user)
  userProjects: UserProject[]

  @OneToMany(() => UserTech, (userTech) => userTech.user)
  userTechs: UserTech[]

  @DeleteDateColumn()
  deletedAt: Date
}
