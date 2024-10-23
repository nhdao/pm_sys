import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { PrjStatus } from 'src/constants/project-status';
import { Type } from 'class-transformer';

export class UpdateProjectDto extends PartialType(OmitType(CreateProjectDto, ['departmentId','start_date', 'due_date'] as const)) {
  @ApiPropertyOptional()
  @IsString()
  @IsEnum(PrjStatus)
  @IsOptional()
  status: PrjStatus

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  start_date: Date;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  due_date: Date;
}
