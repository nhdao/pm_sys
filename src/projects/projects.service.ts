/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Brackets, Repository } from 'typeorm';
import { UserProject } from 'src/users/entities/user-project.entity';
import { ProjectTech } from './entities/project-tech.entity';
import { ClientsService } from 'src/clients/clients.service';
import { DepartmentsService } from 'src/departments/departments.service';
import { TechnologiesService } from 'src/technologies/technologies.service';
import { UsersService } from 'src/users/users.service';
import { AssignUserDto } from './dto/assign-user.dto';
import { AssignTechDto } from './dto/assign-tech.dto';
import { PrjStatus } from 'src/constants/project-status';
import { IUser } from 'src/interfaces/current-user.interface';
import { ProjectStatisticDto } from './dto/project-statistic.dto';
import { Task } from 'src/tasks/entities/task.entity';
import { ProjectPaginationDto } from './dto/project-pagination.dto';
import { plainToInstance } from 'class-transformer';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(UserProject) private userProjectRepo: Repository<UserProject>,
    @InjectRepository(ProjectTech) private projectTechRepo: Repository<ProjectTech>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    private clientService: ClientsService,
    private departmentService: DepartmentsService,
    private techService: TechnologiesService,
    private userService: UsersService,
    private mailService: MailService
  ) {}

  async adminCountProjects(projectStatistic: ProjectStatisticDto) {
    const { type, status, techId, clientId, start_date } = projectStatistic
    const result = []
    if(type) {
      const countByType = await this.projectRepo.createQueryBuilder('project')
                          .where('project.type = :type', { type })
                          .getCount()
      result.push({ countByType })
    }
    if(status) {
      const countByStatus = await this.projectRepo.createQueryBuilder('project')
                            .where('project.status = :status', { status })
                            .getCount()
      result.push({ countByStatus })
    }

    if(clientId) {
      const countByClient = await this.projectRepo.createQueryBuilder('project')
                            .leftJoinAndSelect('project.client', 'resultClient')
                            .where('resultClient.id = :clientId', { clientId })
                            .getCount()
      result.push({ countByClient })
    }
    if(start_date) {
      const countByStartDate = await this.projectRepo.createQueryBuilder('project')
                              .where('project.start_date > :start_date', { start_date })
                              .getCount()
      result.push({ countByStartDate })
    }
    if(techId) {
      const countByTech = await this.projectRepo.createQueryBuilder('project')
                          .leftJoinAndSelect('project.projectTechs', 'joinTechs')
                          .leftJoinAndSelect('joinTechs.tech', 'resultTechs')
                          .where('resultTechs.id = :techId', { techId })
                          .getCount()
      result.push({ countByTech })
    }
    return result
  }

  async getUsersByProject(id: number, currentUser?: IUser) {
    const foundProject = await this.projectRepo.findOne({
      where: { id },
      relations: ['manager', 'userProjects.user'],
      select: { 
        userProjects: {
          id: true,
          user: { id: true, email: true, firstname: true, lastname: true, approved: true }
        }
      }
    })
    const users = foundProject.userProjects.map(item => plainToInstance(UserResponseDto, item.user, {
      excludeExtraneousValues: true
    }))
    if(!foundProject) {
      throw new BadRequestException('Project not exist')
    }
    if(currentUser) {
      if (foundProject.manager.id === +currentUser.id) {
        return users
      }
      if(!foundProject.userProjects.length ||
         !(foundProject.userProjects.some(userProject => userProject.user.id === +currentUser.id))) {
        throw new BadRequestException('You are not assigned to this project or not manager of this project')
      } 
      return users
    }
    return users
  }

  async getProjectInfo(id: number, currentUser?: IUser) {
    const foundProject = await this.projectRepo.findOne({
      where: { id },
      relations: ['manager', 'projectTechs.tech', 'userProjects.user'],
      select: {
        manager: { id: true, email: true, firstname: true, lastname: true },
        projectTechs: { 
          id: true,
          tech: { name: true }
        }
      } 
    });
    if(!foundProject) {
      throw new NotFoundException('Project not found')
    }
    if(currentUser) {
      if (foundProject.manager.id === +currentUser.id) {
        delete foundProject.userProjects
        return foundProject
      } 
      if (!foundProject.userProjects.length || 
          !(foundProject.userProjects.some(userProject => userProject.user.id === +currentUser.id))) {
          throw new BadRequestException('You are not assigned to this project or not manager of this project');
      } 
      delete foundProject.userProjects
      return foundProject
    }
    delete foundProject.userProjects
    return foundProject
  }

  async createProject(createProjectDto: CreateProjectDto, currentUser?: IUser) {
    const { departmentId, clientId, ...otherInfo } = createProjectDto
    const checkDepartmentExist = await this.departmentService.checkDepartmentExist(departmentId)
    const checkClientExist = await this.clientService.checkClientExist(clientId)

    if(!checkDepartmentExist || !checkClientExist) {
      throw new BadRequestException('Department or Client not exist')
    }

    if(!checkDepartmentExist.manager) {
      throw new BadRequestException('Department does not have a manager yet')
    }

    if(currentUser) {
      if(+currentUser.id !== checkDepartmentExist.manager.id) {
        throw new BadRequestException('You are not manager of this department')
      }
    }

    const checkProjectExist = await this.projectRepo.findOneBy({ name: createProjectDto.name })
    if(checkProjectExist) {
      throw new BadRequestException(`Project with name ${createProjectDto.name} already exists`)
    }

    const newProject = this.projectRepo.create({
      department: checkDepartmentExist,
      client: checkClientExist,
      ...otherInfo,
      manager: checkDepartmentExist.manager
    })
    await this.projectRepo.save(newProject)
    return plainToInstance(ProjectResponseDto, newProject, {
      excludeExtraneousValues: true
    })
  }

  async findAllProjectsByUser(projectPaginationDto: ProjectPaginationDto, currentUser?: IUser) {
    const { name, type, status, startFrom, startTo, order, skip, take, page } = projectPaginationDto
    let projectQueryBuilder = this.projectRepo.createQueryBuilder('project')
    if(currentUser) {
      projectQueryBuilder = this.projectQueryBuilder(currentUser)
    }

    if(name) {
      projectQueryBuilder.andWhere('project.name ILIKE :name', { name: `%${name}%` })
    }
    if(type) {
      projectQueryBuilder.andWhere('project.type = :type', { type })
    }
    if(status) {
      projectQueryBuilder.andWhere('project.status = :status', { status })
    }
    if(startFrom) {
      startTo
        ? projectQueryBuilder.andWhere('DATE(project.start_date) BETWEEN DATE(:startFrom) AND DATE(:startTo)', { startFrom, startTo })
        : projectQueryBuilder.andWhere('DATE(project.start_date) >= DATE(:startFrom)', { startFrom })
    }
    projectQueryBuilder
      .orderBy('project.id', order)
      .skip(skip)
      .take(take)

      const result = await projectQueryBuilder.getMany()
      const transformedResult = result.map(item => plainToInstance(ProjectResponseDto, item, {
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

  async updateProjectById(id: number, updateProjectDto: UpdateProjectDto, currentUser?: IUser) {
    const { name, clientId, due_date, start_date, departmentId, ...other } = updateProjectDto
    const foundProject = await this.projectRepo.findOne({
      where: { id },
      relations: ['manager', 'tasks'],
      select: {
        manager: { id: true, email: true, firstname: true, lastname: true } 
      }
    })
    if(!foundProject) {
      throw new NotFoundException('Project not found')
    }

    if(currentUser) {
      if(foundProject.manager.id !== +currentUser.id) {
        throw new BadRequestException('You are not manager of this project')
      } 
    }

    if(start_date && due_date) {
      const startDate = new Date(start_date)
      const dueDate = new Date(due_date)
      const createdDate = new Date(foundProject.created_date)
      if(startDate < createdDate) {
        throw new BadRequestException('Start date must be after or equal to created date')
      }
      if(startDate >= dueDate) {
        throw new BadRequestException('Start date must be before due date')
      }
      foundProject.start_date = start_date
      foundProject.due_date = due_date 
    } else if(start_date) {
      if(new Date(start_date) < new Date(foundProject.created_date) 
         ||
         new Date(start_date) >= new Date(foundProject.due_date) ) {
        throw new BadRequestException(
          'Start date must be equal or after current created date or before current due date'
        )
      }
      foundProject.start_date = start_date  
    } else if(due_date) {
      if(new Date(due_date) <= new Date(foundProject.start_date)) {
        throw new BadRequestException('Due date must be after current start date')
      }
      foundProject.due_date = due_date  
    }
    if(name) {
      const checkProjectExist = await this.projectRepo.findOne({
        where: {
          name: name 
        }
      })
      if(checkProjectExist) {
        throw new BadRequestException(`Project with name ${name} already exists`)
      }
      foundProject.name = name
    }
    if(clientId) {
      const checkClientExist = await this.clientService.checkClientExist(clientId)
      if(!checkClientExist) {
        throw new BadRequestException(`No client found with id ${clientId}`)
      }
      foundProject.client = checkClientExist
    }
    if(departmentId) {
      if(foundProject.tasks.length) {
        throw new BadRequestException('Some tasks have been assigned to this project')
      }
      const checkDepartmentExist = await this.departmentService.checkDepartmentExist(departmentId)
      if(!checkDepartmentExist) {
        throw new BadRequestException('Department not found')
      }
      if(currentUser) {
        if(checkDepartmentExist.manager.id !== +currentUser.id) {
          throw new BadRequestException('You are not manager of this department')
        }
      }
      foundProject.department = checkDepartmentExist
    }
    Object.assign(foundProject, other)
    await this.projectRepo.save(foundProject)
    return plainToInstance(ProjectResponseDto, foundProject, {
      excludeExtraneousValues: true
    }) 
  }

  async removeProjectById(id: number, currentUser?: IUser) {
    const foundProject = await this.projectRepo.findOne({
      where: { id },
      relations: ['userProjects.user', 'manager'],
      select: { 
        manager: {id: true, email: true, firstname: true, lastname: true }
      }
    })
    if(!foundProject) {
      throw new NotFoundException('Project not found')
    }
    if(currentUser) {
      if(foundProject.manager.id !== +currentUser.id) {
        throw new BadRequestException('You are not manager of this project')
      }
    }
    if(foundProject.status !== PrjStatus.CLOSE) {
      throw new BadRequestException('Project is not done yet')
    } 
    await this.projectRepo.softDelete({ id })
    await this.userProjectRepo.softDelete({ project: foundProject })
    await this.projectTechRepo.softDelete({ project: foundProject })
    await this.taskRepo.softDelete({ project: foundProject })
    return 'Project deleted successfully'
  }

  async assignUsersToProject(id: number, assignUserDto: AssignUserDto, currentUser?: IUser) {
    const userIds = Array.from(new Set(assignUserDto.userIds))

    const foundProject = await this.projectRepo.findOne({ 
      where:{ id }, 
      relations: ['manager', 'userProjects.project', 'userProjects.user'] 
    })
    
    if(!foundProject || foundProject.status === PrjStatus.CLOSE) {
      throw new BadRequestException('Project not exist or has been closed')
    }
    if(currentUser) {
      if(foundProject.manager.id !== +currentUser.id) {
        throw new UnauthorizedException('You are not manager of this project')
      }
    }

    const users = await Promise.all(userIds.map(async userId => {
        const foundUser = await this.userService.checkUserExist(userId)
        if (!foundUser || !foundUser.approved) {
          throw new BadRequestException(`User with id ${userId} not verified yet`)
        }
        if(currentUser) {
          if(foundUser.department?.id !== +currentUser.department.id) {
            throw new BadRequestException(`User with id ${userId} does not belong to your department`)
          }
        }
        if(foundProject.userProjects.length && 
           foundProject.userProjects.some(userProject => userProject.user.id === foundUser.id)) {
          throw new BadRequestException(`User with id ${userId} is already assigned to this project`);
        }
        return foundUser
      })
    )
    const userProjects = users.map(user => {
      return this.userProjectRepo.create({
        user: user,
        project: foundProject
      })
    })

    await this.userProjectRepo.save(userProjects)
    users.forEach(async user => await this.mailService.projectAssignedNotify(
      user.email, foundProject.name, foundProject.start_date.toString())
    )
    return await this.projectRepo.findOne({
      where: { id },
      relations: ['userProjects.user'], 
      select: {
        userProjects: {
          id: true,
          user: { id: true, email: true, firstname: true, lastname: true, approved: true }
        }
      }
    })
  }

  async assignTechsToProject(id: number, assignTechDto: AssignTechDto, currentUser?: IUser) {
    const techIds = Array.from(new Set(assignTechDto.techIds))
    const foundProject = await this.projectRepo.findOne({ 
      where:{ id }, 
      relations: ['manager', 'projectTechs.tech'] 
    })
    if(currentUser) {
      if(foundProject.manager.id !== +currentUser.id) {
        throw new BadRequestException('You are not manager of this project')
      }
    }

    if(!foundProject || foundProject.status === PrjStatus.CLOSE) {
      throw new BadRequestException('Project not exist or has been closed')
    }

    const techs = await Promise.all(techIds.map(async techId => {
      const foundTech = await this.techService.checkTechnologyExist(techId);
      if (!foundTech) {
        throw new BadRequestException(`Tech with id ${techId} not found`);
      }
      if(foundProject.projectTechs.some(projectTech => projectTech.tech.id === foundTech.id)) {
        throw new BadRequestException(`Tech with id ${techId} is already assigned to this project`);
      }
      return foundTech
    }))
    
    const projectTechs = techs.map(tech => {
      return this.projectTechRepo.create({
        tech: tech,
        project: foundProject
      })
    })
    await this.projectTechRepo.save(projectTechs)
    return await this.projectRepo.findOne({
      where: { id },
      relations: ['projectTechs.tech']
    })
  }

  async countProjects(projectStatistic: ProjectStatisticDto, currentUser: IUser) {
    const { type, status, techId, clientId, start_date } = projectStatistic
    const result = []
    if(type) {
      const countByType = await this.projectQueryBuilder(currentUser)
                          .andWhere('project.type = :type', { type })
                          .getCount();

      result.push({ countByType });
    }
    if(status) {
      const countByStatus = await this.projectQueryBuilder(currentUser)
                            .andWhere('project.status = :status', { status })
                            .getCount();      

      result.push({ countByStatus });
    }

    if(clientId) {
      const countByClient = await this.projectQueryBuilder(currentUser)
                            .andWhere('resultClient.id = :clientId', { clientId })
                            .getCount()
      result.push({ countByClient })
    }
    if(start_date) {
      const countByStartDate = await this.projectQueryBuilder(currentUser)
                              .andWhere('project.start_date > :start_date', { start_date })
                              .getCount()
      result.push({ countByStartDate })
    }
    if(techId) {
      const countByTech = await this.projectQueryBuilder(currentUser)
                          .andWhere('resultTechs.id = :techId', { techId })
                          .getCount()
      result.push({ countByTech })
    }
    return result
  }

  async checkProjectExist(id: number) {
    return await this.projectRepo.findOne({
      where: { id },
      relations: ['manager', 'userProjects.user'],
      select: {
        userProjects: {
          id: true,
          user: { id: true, email: true, firstname: true, lastname: true }
        },
        manager: { id: true, email: true, firstname: true, lastname: true }
      }
    })
  }

  projectQueryBuilder(currentUser: IUser) {
    return this.projectRepo.createQueryBuilder('project')
      .leftJoinAndSelect('project.manager', 'manager')
      .leftJoinAndSelect('project.client', 'resultClient')
      .leftJoinAndSelect('project.userProjects', 'joinUsers')
      .leftJoinAndSelect('joinUsers.user', 'assignedUsers')
      .leftJoinAndSelect('project.projectTechs', 'joinTechs')
      .leftJoinAndSelect('joinTechs.tech', 'resultTechs')
      .where(
        new Brackets(qb => {
          qb.where('manager.id = :managerId', { managerId: +currentUser.id })
            .orWhere('assignedUsers.id = :userId', { userId: +currentUser.id });
        })
      )
    }
}
