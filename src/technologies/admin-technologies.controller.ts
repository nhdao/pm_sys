/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TechnologiesService } from './technologies.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipPermission } from 'src/decorators/is-skip-permission.decorator';
import { TechPaginationDto } from './dto/tech-pagination-query.dto';

@ApiTags('Admin/Technologies')
@Controller('admin/technologies')
export class AdminTechnologiesController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  @ApiOperation({ summary: 'Add new technology to db' })
  @Post()
  create(@Body() createTechnologyDto: CreateTechnologyDto) {
    return this.technologiesService.adminCreateTechnology(createTechnologyDto);
  }

  @SkipPermission()
  @ApiOperation({ summary: 'Get list technologies' })
  @Get()
  findAll(@Query() techPaginationDto: TechPaginationDto) {
    return this.technologiesService.adminFindAllTechnologies(techPaginationDto);
  }

  @ApiOperation({ summary: 'Update technology info' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTechnologyDto: UpdateTechnologyDto) {
    return this.technologiesService.adminUpdateTechnologyById(+id, updateTechnologyDto);
  }

  @ApiOperation({ summary: 'Delete technology' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.technologiesService.adminRemoveTechnologyById(+id);
  } 
}
