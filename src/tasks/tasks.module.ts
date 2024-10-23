import { forwardRef, Module } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity'
import { UsersModule } from 'src/users/users.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { AdminTasksController } from './admin-task.controller';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task
  ]),
    forwardRef(() => UsersModule),
    ProjectsModule,
    MailModule
  ],
  controllers: [TasksController, AdminTasksController],
  providers: [TasksService],
  exports: [TasksService]
})
export class TasksModule {}
