import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AssignUserDto } from './dto/assign-user.dto';
import { AssignTechDto } from './dto/assign-tech.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectStatisticDto } from './dto/project-statistic.dto';
import { SkipPermission } from 'src/decorators/is-skip-permission.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectPaginationDto } from './dto/project-pagination.dto';


@ApiTags('Admin/Projects')
@Controller('admin/projects')
@SkipPermission()
export class AdminProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'Admin: Create new project' })
  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.createProject(createProjectDto);
  }

  @ApiOperation({ summary: 'Admin: Update project info' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.updateProjectById(+id, updateProjectDto);
  }

  @ApiOperation({ summary: 'Admin: Delete project' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.removeProjectById(+id)
  }

  @ApiOperation({ summary: 'Admin: Get project statistic' })
  @Get('project-statistic')
  countProject(@Query() projectStatistic: ProjectStatisticDto) {
    return this.projectsService.adminCountProjects(projectStatistic)
  }

  @ApiOperation({ summary: 'Admin: Get list projects' })
  @Get()
  findAll(@Query() projectPaginationDto: ProjectPaginationDto) {
    return this.projectsService.findAllProjectsByUser(projectPaginationDto);
  }

  @ApiOperation({ summary: 'Get list users of project' })
  @Get(':id/users')
  getUsersByProject(@Param('id') id: string) {
    return this.projectsService.getUsersByProject(+id)
  }

  @ApiOperation({ summary: 'Admin: Get project info' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.getProjectInfo(+id);
  }

  @ApiOperation({ summary: 'Admin: Assign users to project' })
  @Post(':id/assign-users')
  assignUserToProject(@Param('id') id: string, @Body() assignUserDto: AssignUserDto) {
    return this.projectsService.assignUsersToProject(+id, assignUserDto);
  }

  @ApiOperation({ summary: 'Admin: Assign tech to project' })
  @Post(':id/assign-techs')
  assignTechToProject(@Param('id') id: string, @Body() assignTechDto: AssignTechDto) {
    return this.projectsService.assignTechsToProject(+id, assignTechDto);
  }

}
