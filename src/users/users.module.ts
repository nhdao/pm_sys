import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProject } from './entities/user-project.entity';
import { UserTech } from './entities/user-tech.entity';
import { TechnologiesModule } from 'src/technologies/technologies.module';
import { TasksModule } from 'src/tasks/tasks.module';
import { AdminUsersController } from './admin-users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { Task } from 'src/tasks/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
      User, UserProject, UserTech, Task
    ]),
    TechnologiesModule,
    forwardRef(() => TasksModule),
    AuthModule
  ],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
