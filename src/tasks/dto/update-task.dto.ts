import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTaskDto extends PartialType(OmitType(CreateTaskDto, ['deadline'] as const)) {
  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  deadline: Date
}
