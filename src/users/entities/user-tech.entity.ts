import { DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Technology } from "src/technologies/entities/technology.entity";

@Entity()
export class UserTech {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, (user) => user.userTechs)
  user: User

  @ManyToOne(() => Technology, (tech) => tech.userTechs)
  tech: Technology

  @DeleteDateColumn()
  deletedAt: Date
}
