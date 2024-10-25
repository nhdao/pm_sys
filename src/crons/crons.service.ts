import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { EPrjStatus } from 'src/constants/project-status';
import { MailService } from 'src/mail/mail.service';
import { Project } from 'src/projects/entities/project.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { Not, Repository } from 'typeorm';

@Injectable()
export class CronsService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    private mailService: MailService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkProjectDueDate() {
    const projects = await this.projectRepo.find({
      where:{ 
        status: Not(EPrjStatus.CLOSE) 
      },
      relations: ['manager'],
      select: { manager: { id: true, email: true, firstname: true, lastname: true }}
    })
    const modifiedProjects = []
    const currentDate = new Date()
    for(const project of projects) {
      if(
        project.due_date.getFullYear() === currentDate.getFullYear() &&
        project.due_date.getMonth() === currentDate.getMonth() &&
        project.due_date.getDate() === currentDate.getDate()
      ) {
        project.status = EPrjStatus.CLOSE
        await this.projectRepo.save(project)
        await this.mailService.projectCloseNotify(
          project.manager.email, project.name, project.due_date.toString()
        )
        delete project.deletedAt
        modifiedProjects.push(project)
      }
    }
    return modifiedProjects
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async remindDeadline() {
    const tasks = await this.taskRepo.find({
      where: { done: false }
    })
    const upcomingTasks  = []
    const currentDate = new Date()
    const currentDatePlus30Mins = new Date(currentDate.getTime() + 30 * 60 * 1000);
    for(const task of tasks) {
      const taskDl = new Date(task.deadline)
      if(taskDl >= currentDate && taskDl <= currentDatePlus30Mins) {
        const taskDetail = await this.taskRepo.findOne({
          where: { id: task.id },
          relations: ['user']
        })
        upcomingTasks.push(taskDetail)
      }
    }
    const results = await Promise.all(upcomingTasks.map(async upcomingTask => {
      await this.mailService.taskDeadlineNotify(
        upcomingTask.user.email, upcomingTask.description, upcomingTask.deadline.toString()
      )
      const userResponse = plainToInstance(UserResponseDto, upcomingTask.user, {
        excludeExtraneousValues: true
      })
      upcomingTask.user = userResponse
      console.log('Hello from crons')
      return upcomingTask
    }))
    return results
  }
}
