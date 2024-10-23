import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';
import { PermissisonPaginationDto } from './dto/permission-pagination-query.dto';

@Injectable()
export class PermissionsService {
  constructor(@InjectRepository(Permission) private permissionRepo: Repository<Permission>) {}

  async adminCreatePermisison(createPermissionDto: CreatePermissionDto) {
    const { method, api_path } = createPermissionDto 
    const checkPermissionExist = await this.permissionRepo.findOneBy({ 
      method: method.toUpperCase(), 
      api_path 
    })
    if(checkPermissionExist) {
      throw new BadRequestException('This permission already exists')
    }

    const newPermission = this.permissionRepo.create({
      method: method.toUpperCase(),
      api_path,
    })

    return await this.permissionRepo.save(newPermission) 
  }

  async adminFindAllPermissions(permissionPaginationDto: PermissisonPaginationDto) {
    const { skip, page, take, order, method, apiPath } = permissionPaginationDto
    const permissionQueryBuilder = this.permissionRepo.createQueryBuilder('permission')
    if(method) {
      permissionQueryBuilder.andWhere('permission.method ILIKE :method', { method: `%${method}%` })
    }
    if(apiPath) {
      permissionQueryBuilder.andWhere('permission.api_path ILIKE :apiPath', { apiPath: `%${apiPath}%` })
    }
    permissionQueryBuilder 
      .orderBy('permission.id', order)
      .skip(skip)
      .take(take)
    const result = await permissionQueryBuilder.getMany()
    return {
      page: page,
      skip: skip,
      limit: take,
      count: result.length,
      result
    }
  }

  async adminGetPermissionInfo(id: number) {
    const foundPermission = await this.permissionRepo.findOne({
      where: { id },
      relations: ['rolePermissions.role']
    })
    if(!foundPermission) {
      throw new NotFoundException('Permission not found')
    }
    return foundPermission
  }

  async adminUpdatePermissionById(id: number, updatePermissionDto: UpdatePermissionDto) {
    const { method, api_path } = updatePermissionDto 
    const foundPermission = await this.permissionRepo.findOneBy({ id })
    if(!foundPermission) {
      throw new NotFoundException('Permission not found')
    } 

    const checkPermissionExist = await this.permissionRepo.findOneBy({ 
      method: method.toUpperCase(), 
      api_path: api_path
    })

    if(checkPermissionExist) {
      throw new BadRequestException(
        `This permission already exists with ${method.toUpperCase()} and ${api_path}`
      )
    }
    foundPermission.method = method.toUpperCase()
    foundPermission.api_path = api_path
    return await this.permissionRepo.save(foundPermission) 
  }

  async adminRemovePermissionById(id: number) {
    const foundPermission = await this.permissionRepo.findOne({
      where: { id },
      relations: ['rolePermissions.role']
    })
    if(!foundPermission) {
      throw new BadRequestException('Permission not found')
    }
    if(foundPermission.rolePermissions.length) {
      throw new BadRequestException('Permission is assigned by some roles')
    }
    await this.permissionRepo.softDelete({ id })
    return 'Permission deleted successfully'
  }

  async checkPermisisonExist(id: number) {
    return await this.permissionRepo.findOneBy({ id })
  }
}
