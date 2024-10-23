import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipPermission } from 'src/decorators/is-skip-permission.decorator';
import { ClientPaginationDto } from './dto/client-pagination-query.dto';

@ApiTags('Admin/Clients')
@Controller('admin/clients')
export class AdminClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @ApiOperation({ summary: 'Admin: Add new client to db' })
  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.adminCreateClient(createClientDto);
  }

  @SkipPermission()
  @ApiOperation({ summary: 'Admin: Get list clients' })
  @Get()
  findAll(@Query() clientPaginationDto: ClientPaginationDto) {
    return this.clientsService.adminFindAllClients(clientPaginationDto);
  }

  @ApiOperation({ summary: 'Admin: Get client info' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.adminGetClientInfo(+id);
  }

  @ApiOperation({ summary: 'Admin: Update client info' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.adminUpdateClientById(+id, updateClientDto);
  }

  @ApiOperation({ summary: 'Admin: Delete client info' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.adminRemoveClientById(+id);
  }
}
