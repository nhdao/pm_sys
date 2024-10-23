import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';
import { ClientPaginationDto } from './dto/client-pagination-query.dto';

@Injectable()
export class ClientsService {
  constructor(@InjectRepository(Client) private clientRepo: Repository<Client>) {}

  async adminCreateClient(createClientDto: CreateClientDto) {
    const { name } =createClientDto
    const checkClientExist = await this.clientRepo.findOneBy({ name })
    if(checkClientExist) {
      throw new BadRequestException(`Client with name ${name} already exists`)
    }

    const newClient = this.clientRepo.create(createClientDto)
    return await this.clientRepo.save(newClient)
  }

  async adminFindAllClients(clientPaginationDto: ClientPaginationDto) {
    const { skip, take, page, order, name } = clientPaginationDto
    const clientQueryBuilder = this.clientRepo.createQueryBuilder('client')
    if(name) {
      clientQueryBuilder.andWhere('client.name ILIKE :name', { name: `%${name}%` })
    }
    clientQueryBuilder
      .orderBy('client.id', order)
      .skip(skip)
      .take(take)

    const result = await clientQueryBuilder.getMany()

    return {
      page: page,
      skip: skip,
      limit: take,
      count: result.length,
      result
    }
  }

  async adminGetClientInfo(id: number) {
    const foundClient = await this.clientRepo.findOne({
      where: { id },
      relations: ['projects']
    })
    if(!foundClient) {
      throw new NotFoundException('Client not found')
    }
    return foundClient
  }

  async adminUpdateClientById(id: number, updateClientDto: UpdateClientDto) {
    const { name, ...other } = updateClientDto
    const foundClient = await this.clientRepo.findOneBy({ id })
    if(!foundClient) {
      throw new NotFoundException('Client not found')
    }
    if(name) {
      const checkClientExist = await this.clientRepo.findOneBy({ name: updateClientDto.name })
      if(checkClientExist) {
        throw new BadRequestException(`Client with name ${updateClientDto.name} already exists`)
      }
      foundClient.name = name
    }
    console.log(other)
    Object.assign(foundClient, other)
    return await this.clientRepo.save(foundClient)
  }

  async adminRemoveClientById(id: number) {
    const foundClient = await this.clientRepo.findOne({ 
      where: { id },
      relations: ['projects']
    })
    if(!foundClient) {
      throw new NotFoundException('Client has been deleted')
    }
    if(foundClient.projects.length) {
      throw new BadRequestException('Client has some projects in system')
    }
    await this.clientRepo.softDelete({ id })
    return 'Client deleted successfully'
  }

  async checkClientExist(id: number) {
    return await this.clientRepo.findOneBy({ id })
  }
}
