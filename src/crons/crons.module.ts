import { Module } from '@nestjs/common';
import { CronsService } from './crons.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { Project } from 'src/projects/entities/project.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project, Task, User
    ]),
    MailModule
  ],
  providers: [CronsService],
})
export class CronsModule {}
