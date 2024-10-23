import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatusDto } from './dto/task-status.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { IUser } from 'src/interfaces/current-user.interface';
import { TaskPaginationDto } from './dto/task-pagination-query.dto';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Create a new task' })
  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() currentUser: IUser) {
    return this.tasksService.createTask(createTaskDto, currentUser);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Get list tasks of user' })
  @Get()
  findAll(@Query() taskPaginationDto: TaskPaginationDto ,@CurrentUser() currentUser: IUser) {
    return this.tasksService.findAllTasksByUser(taskPaginationDto, currentUser)
  }

  @ApiOperation({ summary: 'Get task info' })
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() currentUser: IUser) {
    return this.tasksService.getTaskInfo(+id, currentUser);
  }

  @ApiOperation({ summary: 'Change task status' })
  @Patch('/change-status')
  changeStatus(@Body() taskStatus: TaskStatusDto, @CurrentUser() currentUser: IUser) {
    return this.tasksService.changeTaskStatus(taskStatus, currentUser)
  }

  @ApiOperation({ summary: 'Update task info' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @CurrentUser() currentUser: IUser) {
    return this.tasksService.updateTaskById(+id, updateTaskDto, currentUser);
  }

  @ApiOperation({ summary: 'Delete task' })
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() currentUser: IUser) {
    return this.tasksService.removeTaskById(+id, currentUser);
  }
}
