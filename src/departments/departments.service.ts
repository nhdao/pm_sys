/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { UserDepartmentDto } from 'src/users/dto/user-department.dto';
import { User } from 'src/users/entities/user.entity';
import { IUser } from 'src/interfaces/current-user.interface';
import { DepartmentPaginationDto } from './dto/department-pagination.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department) private departmentRepo: Repository<Department>,
    private userService: UsersService,
  ) {}
  
  async adminCreateDepartment(createDepartmentDto: CreateDepartmentDto) {
    const { name, ...otherInfo } = createDepartmentDto

    const checkDepartmentExist = await this.departmentRepo.findOneBy({ name })
    if(checkDepartmentExist) {
      throw new BadRequestException('This department already exists')
    }

    const newDepartment = this.departmentRepo.create({
      name,
      ...otherInfo
    })
    return await this.departmentRepo.save(newDepartment)
  }

  async adminUpdateDepartmentById(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    const { name, managerId, ...other } = updateDepartmentDto
    const foundDepartment = await this.departmentRepo.findOne({
      where: { id },
      relations: ['users'],
      select: {
        users: { id: true, email: true, firstname: true, lastname: true },
      }
    })
    if(!foundDepartment) {
      throw new NotFoundException('Department not found')
    }

    if(name) {
      const checkDepartmentExist = await this.departmentRepo.findOneBy({name:  name })
      if(checkDepartmentExist) {
        throw new BadRequestException('This department already exists')
      }
    }

    if(managerId) {
      const foundUser = await this.userService.checkUserExist(managerId)
      if(!foundUser) {
        throw new BadRequestException(`No user found with id ${managerId}`)
      }
      if(!foundUser.approved) {
        throw new BadRequestException(`User with id ${managerId} is not verified yet`)
      }
      if(!foundDepartment.users.find(user => user.id === foundUser.id)) {
        throw new BadRequestException('This user is not a member of this department')
      }
      foundDepartment.manager = foundUser
      plainToInstance(UserResponseDto, foundUser, {
        excludeExtraneousValues: true
      })
    }
    Object.assign(foundDepartment, other)
    return await this.departmentRepo.save(foundDepartment)
  }

  async adminFindAllDepartments(departmentPaginationDto: DepartmentPaginationDto) {
    const { name, skip, order, take, page } = departmentPaginationDto
    const departmentQueryBuilder = this.departmentRepo.createQueryBuilder('department')

    if(name) {
      departmentQueryBuilder.andWhere('department.name ILIKE :name', { name: `%${name}%` })
    }
    departmentQueryBuilder
      .orderBy('department.id', order)
      .skip(skip)
      .take(take)

      const result = await departmentQueryBuilder.getMany()

      return {
        page: page,
        skip: skip,
        limit: take,
        count: result.length,
        result
      }
  }

  async adminRemoveDepartmentById(id: number) {
    const foundDepartment = await this.departmentRepo.findOne({
      where: { id },
      relations: ['users', 'projects']
    })
    if(!foundDepartment) {
      throw new NotFoundException('Department not found')
    }
  
    if(foundDepartment.projects.length) {
      throw new BadRequestException('This department is in charged of some projects')
    }

    foundDepartment.users.forEach(async user => {
      await this.userService.updateDepartment(null, user)
    })
    await this.departmentRepo.softDelete({ id })
    return 'Department deleted successfully'
  }

  async adminAssignDepartmentForUsers(id: number, userDepartment: UserDepartmentDto) {
    const userIds = Array.from(new Set(userDepartment.userIds))

    const foundDepartment = await this.departmentRepo.findOneBy({ id })
    if(!foundDepartment) {
      throw new NotFoundException(`Department with id ${id} not found`)
    }
    const foundUsers = await Promise.all(userIds.map(async userId => {
      const foundUser = await this.userService.checkUserExist(userId)
      if(!foundUser) {
        throw new BadRequestException(`User with id ${userId} not found`)
      }
      if(!foundUser.approved) {
        throw new BadRequestException(`User with id ${userId} is not verified yet`)
      }
      const checkManager = await this.departmentRepo.findOne({ where: { manager: foundUser }})
      if(checkManager) {
        throw new BadRequestException(
          `Can not assign user with id ${userId} because he/she is manager at other department`
        )
      }
      await this.userService.updateDepartment(foundDepartment, foundUser)
      return plainToInstance(UserResponseDto, foundUser, {
        excludeExtraneousValues: true
      })
    }))

    return {
      department: plainToInstance(DepartmentResponseDto, foundDepartment, {
        excludeExtraneousValues: true
      }),
      users: foundUsers
    }
  }

  async getDepartmentInfo(id: number, currentUser?: IUser) {
    const foundDepartment = await this.departmentRepo.findOne({
      where: { id },
      relations: ['manager'],
      select: {
        manager: { id: true, email: true, firstname: true, lastname: true }
      }
    })
    if(!foundDepartment) {
      throw new NotFoundException('Department not found')
    }
    if(currentUser) {
      if(+currentUser.department.id !== id) {
        throw new BadRequestException('You are not assigned to this department')
      }
    }
    return foundDepartment
  }

  async getUsersByDepartment(id: number, currentUser?: IUser) {
    const result = await this.departmentRepo.findOne({
      where: { id },
      relations: ['manager', 'users'],
      select: {
        manager: { id: true, email: true, firstname: true, lastname: true },
        users: { id: true, email: true, firstname: true, lastname: true }
      }
    })
    if(!result) {
      throw new BadRequestException('Department not found')
    }
    if(currentUser) {
      if(+currentUser.department.id !== id) {
        throw new BadRequestException('You are not assigned to this department')
      }
    }
    return result
  }

  async getProjectsByDepartment(id: number, currentUser?: IUser) {
    const result = await this.departmentRepo.findOne({
      where: { id },
      relations: ['manager', 'projects'],
      select: {
        manager: { id: true, email: true, firstname: true, lastname: true }
      }
    })
    if(!result) {
      throw new BadRequestException('Department not found')
    }
    console.log(result)
    if(currentUser) {
      if( +currentUser.id !== result.manager?.id) {
        throw new BadRequestException('You are not assigned to this department')
      }
    }
    return result
  }

  async findDepartmentByUser(currentUser: User) {
    const assignDepartment = await this.departmentRepo.find({
      where: [
        {users: {id: currentUser.id}}
      ]
    })
    return assignDepartment
  }

  async checkDepartmentExist(id: number) {
    return await this.departmentRepo.findOne({
      where: { id },
      relations: ['manager'],
      select: { manager: { id: true, email: true, firstname: true, lastname: true }}
    })
  }
}
