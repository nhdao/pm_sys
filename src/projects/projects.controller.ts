import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { AssignTechDto } from './dto/assign-tech.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { IUser } from 'src/interfaces/current-user.interface';
import { ProjectStatisticDto } from './dto/project-statistic.dto';
import { ProjectPaginationDto } from './dto/project-pagination.dto';


@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'Create new project of department' })
  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @CurrentUser() currentUser: IUser) {
    return this.projectsService.createProject(createProjectDto, currentUser);
  }

  @ApiOperation({ summary: 'Assign users to project of same department' })
  @Post(':id/assign-users')
  assignUsersToProject(@Param('id') id: string, @Body() assignUserDto: AssignUserDto, @CurrentUser() currentUser: IUser) {
    return this.projectsService.assignUsersToProject(+id, assignUserDto, currentUser);
  }

  @ApiOperation({ summary: 'Assign techs to project of department' })
  @Post(':id/assign-techs')
  assignTechToProject(@Param('id') id: string, @Body() assignTechDto: AssignTechDto, @CurrentUser() currentUser: IUser) {
    return this.projectsService.assignTechsToProject(+id, assignTechDto, currentUser)
  }

  @ApiOperation({ summary: 'Get list users of project' })
  @Get(':id/users')
  getUsersByProject(@Param('id') id: string, @CurrentUser() currentUser: IUser) {
    return this.projectsService.getUsersByProject(+id, currentUser)
  }

  @ApiOperation({ summary: 'Get list projects of user' })
  @Get()
  findAll(@Query() projectPaginationDto: ProjectPaginationDto, @CurrentUser() currentUser: IUser) {
    return this.projectsService.findAllProjectsByUser(projectPaginationDto, currentUser);
  }

  @ApiOperation({ summary: 'Get project statistic of department' })
  @Get('project-statistic')
  countProject(@Query() projectStatistic: ProjectStatisticDto, @CurrentUser() currentUser: IUser) {
    return this.projectsService.countProjects(projectStatistic, currentUser)
  }

  @ApiOperation({ summary: 'Get project info of user' })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: IUser) {
    return this.projectsService.getProjectInfo(+id, currentUser);
  }

  @ApiOperation({ summary: 'Update project info of department' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @CurrentUser() currentUser: IUser) {
    return this.projectsService.updateProjectById(+id, updateProjectDto, currentUser);
  }

  @ApiOperation({ summary: 'Delete project of department' })
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser: IUser) {
    return this.projectsService.removeProjectById(+id, currentUser);
  }
}
