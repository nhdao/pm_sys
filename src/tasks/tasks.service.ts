/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../tasks/dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { UsersService } from 'src/users/users.service';
import { ProjectsService } from 'src/projects/projects.service';
import { TaskStatusDto } from '../tasks/dto/task-status.dto';
import { PrjStatus } from 'src/constants/project-status';
import { IUser } from 'src/interfaces/current-user.interface';
import { TaskPaginationDto } from './dto/task-pagination-query.dto';
import { plainToInstance } from 'class-transformer';
import { TaskResponseDto } from './dto/task-response.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    private userService: UsersService,
    private projectService: ProjectsService,
    private mailService: MailService
  ) {}

  async createTask(createTaskDto: CreateTaskDto, currentUser?: IUser) {
    const { description, userId, projectId, deadline } = createTaskDto
    const foundUser = await this.userService.checkUserExist(userId)
    const foundProject = await this.projectService.checkProjectExist(projectId)
    if(!foundUser || !foundProject) {
      throw new BadRequestException('User or Project not found')
    }
    if(currentUser) {
      if(foundProject.manager.id !== +currentUser.id) {
        throw new BadRequestException('You are not manager of this project')
      }
    }
    if(!foundUser.approved || foundProject.status === PrjStatus.CLOSE) {
      throw new BadRequestException('User not verified or Project has been closed')
    }
    if(!foundProject.userProjects.length || 
       !foundProject.userProjects.some(userProject => userProject.user.id === userId)) {
      throw new BadRequestException('This user is not assigned to this project')
    }
    const newTask = this.taskRepo.create({
      description: description,
      user: foundUser,
      project: foundProject,
      deadline: deadline,
      manager: foundProject.manager
    })
    await this.taskRepo.save(newTask)
    this.mailService.taskAssignedNotify(foundUser.email, newTask.description, newTask.deadline.toString())
    delete newTask.project.userProjects
    delete newTask.user.userProjects
    delete newTask.deletedAt
    return newTask
  }

  async getTaskInfo(id: number, currentUser?: IUser) {
    const foundTask = await this.taskRepo.findOne({
      where: { id },
      relations: ['manager', 'user', 'user.department', 'project', 'project.department'],
      select: {
        manager: { id: true, email: true, firstname: true, lastname: true, approved: true },
        user: { id: true, email: true, firstname: true, lastname: true, approved: true,
          department: { id: true, name: true }
        },
        project: {
          id: true, name: true,
          department: { id: true, name: true }
        }
      }
    })

    if(!foundTask) {
      throw new NotFoundException(`Task with id ${id} not found`)
    }
    if(currentUser) {
      if(foundTask.user.id === +currentUser.id || foundTask.manager.id === +currentUser.id ) {
        return foundTask
      }
      throw new BadRequestException('You are not assigned to this task or not manager of this task')
    }
    return foundTask
  }

  async findAllTasksByUser(taskPaginationDto: TaskPaginationDto, currentUser?: IUser) {
    const { done, dlFrom, dlTo, order, skip, take, page } = taskPaginationDto
    const taskQueryBuilder = this.taskRepo.createQueryBuilder('task')
    if(currentUser) {
      taskQueryBuilder
        .leftJoinAndSelect('task.user', 'assignedUser')
        .leftJoinAndSelect('task.manager', 'assignedManager')
        .where(
            new Brackets(taskQueryBuilder => {
              taskQueryBuilder.where('assignedManager.id = :managerId', { managerId: +currentUser.id })
                .orWhere('assignedUser.id = :userId', { userId: +currentUser.id });
            })
          )
    }
    if(done) {
      taskQueryBuilder.andWhere('task.done = :done', { done })
    }
    if(dlFrom) {
      dlTo
        ? taskQueryBuilder.andWhere('DATE(task.deadline) BETWEEN DATE(:dlFrom) AND DATE(:dlTo)', { dlFrom, dlTo })
        : taskQueryBuilder.andWhere('DATE(task.deadline) >= DATE(:dlFrom)', { dlFrom })
    }
    taskQueryBuilder
      .orderBy('task.id', order)
      .skip(skip)
      .take(take)

    const result = await taskQueryBuilder.getMany()
    const transformedResult = result.map(item => plainToInstance(TaskResponseDto, item, {
      excludeExtraneousValues: true
    }))

    return {
      page: page,
      skip: skip,
      limit: take,
      count: result.length,
      result: transformedResult
    }
  }

  async updateTaskById(id: number, updateTaskDto: UpdateTaskDto, currentUser?: IUser) {
    const { userId, projectId, deadline, ...other } = updateTaskDto
    const foundTask = await this.taskRepo.findOne({
      where: { id },
      relations: ['manager', 'user', 'user.department', 'project', 'project.department'],
      select: {
        manager: { id: true, email: true, firstname: true, lastname: true, approved: true },
        user: { 
          id: true, email: true, firstname: true, lastname: true, approved: true,
          department: {
            id: true, name: true,
          }
        },
        project: {
          id: true, name: true,
          department: { id: true, name: true }
        }
      }
    })
    if(!foundTask) {
      throw new NotFoundException(`Task with id ${id} does not exist`)
    }
    if(currentUser) {
      if(foundTask.manager.id !== +currentUser.id) {
        throw new BadRequestException('You are not manager of this task ')
      }
    }
    if(deadline) {
      if(new Date(deadline).getTime() <= new Date(foundTask.assigned_date).getTime()) {
        throw new BadRequestException('Deadline must be after assigned date')
      }
      foundTask.deadline = deadline
    }

    if(userId) {
      const foundUser = await this.userService.checkUserExist(userId)
      if(!foundUser) {
        throw new BadRequestException('User not found')
      }
      if(!foundUser || !foundUser.approved) {
        throw new BadRequestException('User not found or not verified yet or does not belong to your department')
      }
      if(!foundUser.userProjects.length || 
         !foundUser.userProjects.some(userProject => userProject.project.id === foundTask.project.id)) {
        throw new BadRequestException('This user is not assigned to the current project of the task')
      }
      foundTask.user = foundUser
    }

    if(projectId) {
      const foundProject = await this.projectService.checkProjectExist(projectId)
      if(!foundProject) {
        throw new BadRequestException('Project not found')
      }
      if(currentUser) {
        if(foundProject.manager.id !== +currentUser.id) {
          throw new BadRequestException('You are not manager of this project')
        }
      }
      if(!foundProject.userProjects.length || 
         !foundProject.userProjects.some(userProject => userProject.user.id === foundTask.user.id)) {
       throw new BadRequestException('This project is not assigned to the current user of the task')
     }
      foundTask.project = foundProject
      foundTask.manager = foundProject.manager
    }

    Object.assign(foundTask, other)
    await this.taskRepo.save(foundTask)
    return plainToInstance(TaskResponseDto, foundTask, {
      excludeExtraneousValues: true
    })
  }

  async removeTaskById(id: number, currentUser?: IUser) {
    const foundTask = await this.taskRepo.findOne({ 
      where: { id },
      relations: ['user', 'project', 'manager'],
      select: {
        user: {id: true, email: true, firstname: true, lastname: true },
        manager: {id: true, email: true, firstname: true, lastname: true },
        project: { id: true, name: true, due_date: true}
      }
    })
    if(!foundTask) {
      throw new NotFoundException('Task already been deleted')
    }

    if(currentUser) {
      if(foundTask.manager.id !== +currentUser.id) {
        throw new BadRequestException('You are not manager of this task ')
      }
    }
    if(!foundTask.done) {
      throw new BadRequestException('Task not done yet')
    }
    await this.taskRepo.softDelete({ id })
    return 'Task deleted successfully'
  }

  async changeTaskStatus(taskStatus: TaskStatusDto, currentUser?: IUser) {
    const { taskIds, done } = taskStatus
    const taskIdsArr = Array.from(new Set(taskIds))
    const tasks = Promise.all(taskIdsArr.map(async taskId => {
      const foundTask = await this.taskRepo.findOne({
        where: { id: taskId },
        relations: ['manager', 'user', 'user.department', 'project', 'project.department'],
        select: {
          manager: { id: true, email: true, firstname: true, lastname: true },
          user: {
            id: true, email: true, firstname: true, lastname: true, approved: true,
            department: { id: true, name: true }
          },
          project: {
            id: true, name: true,
            department: { id: true, name: true }
          }
        }
      })
      if(!foundTask) {
        throw new BadRequestException(`Task with id ${taskId} does not exist`)
      }
      if(currentUser) {
        if(foundTask.manager.id !== +currentUser.id) {
          throw new BadRequestException('You are not manager of this task ')
        }
      }
      foundTask.done = done
      await this.taskRepo.save(foundTask)
      return plainToInstance(TaskResponseDto, foundTask, {
        excludeExtraneousValues: true
      })
    }))
    return tasks
  }
}
