import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Technology } from './entities/technology.entity';
import { Repository } from 'typeorm';
import { TechPaginationDto } from './dto/tech-pagination-query.dto';

@Injectable()
export class TechnologiesService {
  constructor(@InjectRepository(Technology) private techRepo: Repository<Technology>) {}

  async adminCreateTechnology(createTechnologyDto: CreateTechnologyDto) {
    const foundTech = await this.techRepo.findOneBy({
      name: createTechnologyDto.name
    })

    if(foundTech) {
      throw new BadRequestException('Tech already exists')
    }
    const newTech = this.techRepo.create(createTechnologyDto)
    return await this.techRepo.save(newTech)
  }

  async adminFindAllTechnologies(techPaginationDto: TechPaginationDto) {
    const { skip, order, page, take, name } = techPaginationDto
    const techQueryBuilder = this.techRepo.createQueryBuilder('tech')
    if(name) {
      techQueryBuilder.andWhere('tech.name ILIKE :name', { name: `%${name}%` })
    }
    techQueryBuilder
      .orderBy('tech.id', order)
      .skip(skip)
      .take(take)

      const result = await techQueryBuilder.getMany()
      return {
        page: page,
        skip: skip,
        limit: take,
        count: result.length,
        result
      }
  }
  
  async adminUpdateTechnologyById(id: number, updateTechnologyDto: UpdateTechnologyDto) {
    const { name } = updateTechnologyDto
    const foundTech = await this.techRepo.findOneBy({ id })
    if(!foundTech) {
      throw new NotFoundException('Technology not found')
    }

    if(name) {
      const checkTechExist = await this.techRepo.findOneBy({
        name: name
      })
  
      if(checkTechExist) {
        throw new BadRequestException(`Tech with name ${name} already exists`)
      }
      foundTech.name = name
    }
    return await this.techRepo.save(foundTech)
  }

  async adminRemoveTechnologyById(id: number) {
    const foundTech = await this.techRepo.findOne({
      where: { id },
      relations: ['userTechs', 'projectTechs']
    })
    if(!foundTech) {
      throw new BadRequestException('Tech has been deleted')
    }
    if(foundTech.userTechs.length || foundTech.projectTechs.length) {
      throw new BadRequestException('Users or Projects are using this tech')
    }
    delete foundTech.userTechs
    delete foundTech.projectTechs
    await this.techRepo.softDelete({ id })
    return 'Tech deleted successfully'
  }

  async checkTechnologyExist(id: number) {
    return await this.techRepo.findOneBy({ id })
  }
}
