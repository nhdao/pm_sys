import { Project } from "src/projects/entities/project.entity";
import { User } from "src/users/entities/user.entity";
import { Column, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @OneToOne(() => User)
  @JoinColumn()
  manager: User

  @Column()
  description: string

  @Column()
  founded_date: Date

  @OneToMany(() => Project, (project) => project.department)
  projects: Project[]
  
  @OneToMany(() => User, (user) => user.department)
  users: User[]

  @DeleteDateColumn()
  deletedAt: Date
}
