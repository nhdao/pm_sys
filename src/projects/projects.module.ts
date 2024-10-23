import { forwardRef, Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectTech } from './entities/project-tech.entity';
import { Project } from './entities/project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from 'src/clients/clients.module';
import { DepartmentsModule } from 'src/departments/departments.module';
import { TechnologiesModule } from 'src/technologies/technologies.module';
import { UsersModule } from 'src/users/users.module';
import { UserProject } from 'src/users/entities/user-project.entity';
import { AdminProjectsController } from './admin-projects.controller';
import { Task } from 'src/tasks/entities/task.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project, ProjectTech, UserProject, Task
    ]),
    ClientsModule,
    TechnologiesModule,
    forwardRef(() => UsersModule),
    forwardRef(() => DepartmentsModule),
    MailModule
  ],
  controllers: [ProjectsController, AdminProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService]
})
export class ProjectsModule {}
