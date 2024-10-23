import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatusDto } from './dto/task-status.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TaskPaginationDto } from './dto/task-pagination-query.dto';

@ApiTags('Admin/Tasks')
@Controller('admin/tasks')
export class AdminTasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Admin: Create a new task' })
  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.createTask(createTaskDto);
  }

  @ApiOperation({ summary: 'Admin: Get list tasks' })
  @Get()
  findAll(@Query() taskPaginationDto: TaskPaginationDto) {
    return this.tasksService.findAllTasksByUser(taskPaginationDto)
  }

  @ApiOperation({ summary: 'Admin: Get task info' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.getTaskInfo(+id)
  }

  @ApiOperation({ summary: 'Admin: Change task status' })
  @Patch('/change-status')
  changeStatus(@Body() taskStatus: TaskStatusDto) {
    return this.tasksService.changeTaskStatus(taskStatus)
  }

  @ApiOperation({ summary: 'Admin: Update task info' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.updateTaskById(+id, updateTaskDto);
  }

  @ApiOperation({ summary: 'Admin: Delete task' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.removeTaskById(+id);
  }
}
