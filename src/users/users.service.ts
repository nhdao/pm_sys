import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { TechnologiesService } from 'src/technologies/technologies.service';
import { UserTech } from './entities/user-tech.entity';
import { UserApprovalDto } from './dto/user-approval.dto';
import { plainToInstance } from 'class-transformer';
import { Role } from 'src/roles/entities/role.entity';
import { Department } from 'src/departments/entities/department.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { UserStatisticDto } from './dto/user-statistic.dto';
import { UserProject } from './entities/user-project.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { UserPaginationDto } from './dto/user-pagination.dto';
import { IUser } from 'src/interfaces/current-user.interface';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserTech) private userTechRepo: Repository<UserTech>,
    @InjectRepository(UserProject) private userProjectRepo: Repository<UserProject>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    private techService: TechnologiesService,
    private redisService: RedisService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { techIds, ...userInfo } = createUserDto
    const newUser = this.userRepo.create(userInfo)
    const uniqueTechIds = Array.from(new Set(techIds))
    const techs = await Promise.all(uniqueTechIds.map(async techId => {
      const tech = await this.techService.checkTechnologyExist(techId)
      if(!tech) {
        throw new NotFoundException('No tech found')
      }
      return tech
    }))

    await this.userRepo.save(newUser)

    const userTechs = techs.map(tech => {
      return this.userTechRepo.create({
        user: newUser,
        tech: tech
      })
    })

    await this.userTechRepo.save(userTechs)
    delete newUser.password
    delete newUser.deletedAt
    return newUser
  }

  async updateProfile(updateUserDto: UpdateUserDto, currentUser: IUser) {
    const { techIds, ...other } = updateUserDto
    const foundUser = await this.userRepo.findOne({
      where: { id: +currentUser.id },
      relations: ['userTechs.tech']
    })
    if(techIds) {
      const uniqueTechIds = Array.from(new Set(techIds))
      const techs = await Promise.all(uniqueTechIds.map(async techId => {
        const tech = await this.techService.checkTechnologyExist(techId)
        if(!tech) {
          throw new NotFoundException('No tech found')
        }
        if(foundUser.userTechs.some(userTech => userTech.tech.id === techId)) {
          throw new BadRequestException(`Tech with id ${techId} is already in user's tech stack`);
        }
        return tech
      }))
      const userTechs = techs.map(tech => {
        return this.userTechRepo.create({
          user: foundUser,
          tech: tech
        })
      })
      await this.userTechRepo.save(userTechs)
    }

    Object.assign(foundUser, other)
    await this.userRepo.save(foundUser)
    return plainToInstance(UserResponseDto, foundUser, {
      excludeExtraneousValues: true
    })
  }

  async adminGetUserInfo(id: number) {
    const foundUser = await this.userRepo.findOne({ 
      where: { id },
      relations: ['department', 'role', 'userTechs.tech'],
      select: {
        department: { id: true, name: true },
        role: { id: true, name: true }
      }
    })

    if(!foundUser) {
      throw new NotFoundException(`User with id ${id} not found`)
    }
    delete foundUser.password
    delete foundUser.deletedAt
    return foundUser
  }

  async adminFindAllUsers(userPaginationDto: UserPaginationDto) {
    const { firstname, lastname, departmentName, approved, skip, order, page, take } = userPaginationDto
    const userQueryBuilder = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')
    if(firstname) {
      userQueryBuilder.andWhere('user.firstname ILIKE :firstname', { firstname: `%${firstname}%` })
    }
    if(lastname) {
      userQueryBuilder.andWhere('user.lastname ILIKE :lastname', { lastname: `%${lastname}%` })
    }
    if(departmentName) {
      userQueryBuilder.andWhere('department.name ILIKE :departmentName', { departmentName: `%${departmentName}%` })
    }
    if(approved) {
      userQueryBuilder.andWhere('user.approved = :approved', { approved })
    }
    userQueryBuilder
      .orderBy('user.id', order)
      .skip(skip)
      .take(take)
    const result = await userQueryBuilder.getMany()
    const transformedResult = result.map(item => plainToInstance(UserResponseDto, item, {
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

  async adminChangeApproval(userApproval: UserApprovalDto) {
    const { approved } = userApproval
    const userIds = Array.from(new Set(userApproval.userIds))
    const foundUsers = await Promise.all(userIds.map(async userId => {
      const foundUser = await this.userRepo.findOne({
        where: { id: userId }
      })
      if(!foundUser) {
        throw new BadRequestException(`User with id ${userId} not found`)
      }
      foundUser.approved = approved
      await this.userRepo.save(foundUser)
      return plainToInstance(UserResponseDto, foundUser, {
        excludeExtraneousValues: true
      })
    }))
    return foundUsers
  }

  async adminCountUser(userStatistic: UserStatisticDto) {
    const { techId, projectId } = userStatistic    
    const result = []
    if(projectId) {
      const countByProject =  await this.userRepo.createQueryBuilder('user')
                              .leftJoinAndSelect('user.userProjects', 'joinProjects')
                              .leftJoinAndSelect('joinProjects.project', 'resultProjects')
                              .where('resultProjects.id = :projectId', { projectId })
                              .getCount()
      result.push({ countByProject })
    }
    if(techId) {
      const countByTech = await this.userRepo.createQueryBuilder('user')
                              .leftJoinAndSelect('user.userTechs', 'joinTechs')
                              .leftJoinAndSelect('joinTechs.tech', 'resultTechs')
                              .where('resultTechs.id = :techId', { techId })
                              .getCount()
      result.push({ countByTech })
    }
    return result
  }

  async adminRemoveUserById(id: number) {
    const foundUser = await this.userRepo.findOneBy({ id })
    if(!foundUser) {
      throw new NotFoundException('User not found')
    }
    await this.userRepo.softDelete({ id })
    await this.userTechRepo.softDelete({ user: foundUser })
    await this.userProjectRepo.softDelete({ user: foundUser })
    await this.taskRepo.softDelete({ user: foundUser })
    return 'Delete user successfully'
  }

  async getProfile(id: number) {
    const foundUser = await this.userRepo.findOne({ 
      where: { id },
      relations: ['department', 'role', 'userTechs.tech'],
      select: {
       id: true, email: true, phone: true, firstname: true, lastname: true,
       gender: true, dob: true, address: true, identity: true, approved: true
      }
    })
    return foundUser
  }

  async updateRole(role: Role, user: User) {
    user.role = role
    await this.redisService.deleteValueByKey(`user:${user.id}`)
    return await this.userRepo.save(user)
  }

  async updateDepartment(department: Department, user: User) {
    user.department = department
    await this.redisService.deleteValueByKey(`user:${user.id}`)
    return await this.userRepo.save(user)
  }

  async findUserByRole(role: Role) {
    return await this.userRepo.find({ 
      where: { role }
    })
  }

  async getDetail(id: number) {
    return await this.userRepo.findOne({
      where: { id },
      relations: ['department', 'role'],
      select: {
        id: true, email: true, firstname: true, lastname: true
      }
    })
  }

  async findOneByEmail(email: string) {
    const foundUser = await this.userRepo.findOneBy({ email })
    return foundUser
  }

  async findUsersByRole(role: Role) {
    const users = await this.userRepo.find({
      where: { role }
    })
    return users
  }

  async checkUserExist(id: number) {
    const checkUserExist = await this.userRepo.findOne({
      where: { id },
      relations: ['department', 'userProjects.project'],
      select: {
        id: true , email: true, firstname: true, lastname: true, approved: true,
        role: { id: true, name: true },
        department: { id: true, name: true }
      }
    })
    return checkUserExist
  }

  async getUserPassword(id: number) {
    const foundUser = await this.userRepo.findOne({
      where: { id }
    })
    if(!foundUser) {
      throw new BadRequestException('User not found')
    }
    return foundUser
  }

  async getUserPermissions(role: Role) {
    return await this.userRepo.findOne({
      where: { role },
      relations: ['role.rolePermissions.permission'],
      select: {
        id: true, email: true, firstname: true, lastname: true, approved: true,
        role: {
          id: true, name: true,
          rolePermissions: {
            id: true,
            permission: { method: true, api_path: true }
          }}
      }})
  }

  async saveResetToken(foundUser: User, passwordResetToken: string | null, passwordResetExpiration: Date | null) {
    foundUser.passwordResetToken = passwordResetToken
    foundUser.passwordResetExpiration = passwordResetExpiration
    await this.userRepo.save(foundUser)
  }

  async updatePassword(foundUser: User, password: string) {
    foundUser.password = password
    await this.userRepo.save(foundUser)
  }

  async findOneByResetToken(passwordResetToken: string) {
    const foundUser = await this.userRepo.findOne({
      where: {
        passwordResetToken: passwordResetToken,
        passwordResetExpiration: MoreThan(new Date())
      }
    })

    return foundUser
  }
}
