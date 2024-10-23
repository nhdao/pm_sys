import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { RolePermission } from './entities/role-permission.entity';
import { PermissionsService } from 'src/permissions/permissions.service';
import { PaginationQueryDto } from 'src/common/pagination-query.dto';
import { UsersService } from 'src/users/users.service';
import { UserRoleDto } from 'src/users/dto/user-role.dto';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(RolePermission) private rolePermisisonRepo: Repository<RolePermission>,
    private permissionService: PermissionsService,
    private userService: UsersService,
  ) {}

  async adminCreateRole(createRoleDto: CreateRoleDto) {
    const { name, description, permissionIds } = createRoleDto
    
    const checkRoleExist = await this.roleRepo.findOneBy({ name })
    console.log(checkRoleExist)
    if(checkRoleExist) {
      throw new BadRequestException(`Role with name ${name} already exists`)
    }
    const newRole = this.roleRepo.create({ name, description })
    const permissions = await Promise.all(permissionIds.map(async permissionId => {
        const permission = await this.permissionService.checkPermisisonExist(permissionId)
        if(!permission) {
          throw new NotFoundException(`No permission found with id ${permissionId}`)
        }
        return permission
    }))
      
    await this.roleRepo.save(newRole)

    const rolePermissions = permissions.map(permission => {
      return this.rolePermisisonRepo.create({
        role: newRole,
        permission: permission
      })
    })

    await this.rolePermisisonRepo.save(rolePermissions)
    return newRole
  }

  async adminFindAllRoles(paginationQueryDto: PaginationQueryDto) {
    const roleQueryBuilder = this.roleRepo
      .createQueryBuilder('role')
      .orderBy('role.id', paginationQueryDto.order)
      .skip(paginationQueryDto.skip)
      .take(paginationQueryDto.take)

      const result = await roleQueryBuilder.getMany()
      return {
        page: paginationQueryDto.page,
        skip: paginationQueryDto.skip,
        limit: paginationQueryDto.take,
        result
      }
  }

  async adminGetRoleInfo(id: number) {
    const foundRole = await this.roleRepo.findOne({ 
      where: { id },
      relations: ['rolePermissions.permission']
    })
    if(!foundRole) {
      throw new NotFoundException(`No role found with id ${id}`)
    }
    return foundRole
  }

  async adminUpdateRoleById(id: number, updateRoleDto: UpdateRoleDto) {
    const { name, permissionIds } = updateRoleDto
    const foundRole = await this.roleRepo.findOne({
      where: { id },
      relations: ['rolePermissions.permission']
    })
    if(!foundRole) {
      throw new NotFoundException(`No role found`)
    }

    if(name) {
      const checkRoleExist = await this.roleRepo.findOneBy({ name: name })
      if(checkRoleExist) {
        throw new BadRequestException(`Role with name ${name} already exists`)
      } 
      foundRole.name = name
    }

    Object.assign(foundRole, updateRoleDto)
    await this.roleRepo.save(foundRole)

    if(permissionIds) {
      const uniquePermissionIds = Array.from(new Set(permissionIds))
      const permissions = await Promise.all(uniquePermissionIds.map(async permissionId => {
        const permission = await this.permissionService.checkPermisisonExist(permissionId)
        if(!permission) {
          throw new NotFoundException(`No permission found with id ${permissionId}`)
        }
        if(foundRole.rolePermissions.some(rolePermission => rolePermission.permission.id === permission.id)) {
          throw new BadRequestException(`Permission with id ${permissionId} is already assigned to this role`);
        }
        return permission
      }))
  
      const rolePermissions = permissions.map(permission => {
        return this.rolePermisisonRepo.create({
          role: foundRole,
          permission: permission
        })
      })
      await this.rolePermisisonRepo.save(rolePermissions)
    }
    return await this.roleRepo.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission']
    })
  }

  async adminRemoveRoleById(id: number) {
    const foundRole = await this.roleRepo.findOne({
      where: { id },
      relations: ['users']
    })
    if(!foundRole) {
      throw new NotFoundException(`No role found with id ${id}`)
    }

    if(foundRole.users.length) {
      throw new BadRequestException(`Role with id ${id} is in used`)
    }
    await this.rolePermisisonRepo.softDelete({ role: foundRole })
    await this.roleRepo.softDelete({ id })
    return 'Role deleted successfully'
  }

  async adminAssignRoleToUsers(id: number, userRole: UserRoleDto) {
    const userIds = Array.from(new Set(userRole.userIds))

    const foundRole = await this.roleRepo.findOneBy({ id })
    if(!foundRole) {
      throw new NotFoundException(`Role with id ${id} not found`)
    }

    const foundUsers = await Promise.all(userIds.map(async userId => {
      const foundUser = await this.userService.checkUserExist(userId)
      if(!foundUser) {
        throw new BadRequestException(`User with id ${userId} not found`)
      }
      if(!foundUser.approved) {
        throw new BadRequestException(`User with id ${userId} is not verified yet`)
      }
      await this.userService.updateRole(foundRole, foundUser)
      return plainToInstance(UserResponseDto,foundUser, {
        excludeExtraneousValues: true
      })
    }))

    return {
      role: foundRole,
      users: foundUsers
    }
  }

  async findRoleByName(name: string) {
    const foundRole = await this.roleRepo.findOne({ 
      where: { name },
      relations: ['rolePermissions.permission']
    })
    if(!foundRole) {
      throw new NotFoundException(`No role found with name ${name}`)
    }
    return foundRole
  }

  async checkRoleExist(id: number) {
    return await this.roleRepo.findOneBy({ id })
  }
}
 

