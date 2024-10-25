import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { EPrjStatus } from 'src/constants/project-status';
import { Type } from 'class-transformer';

export class UpdateProjectDto extends PartialType(OmitType(CreateProjectDto, ['start_date', 'due_date'] as const)) {
  @ApiPropertyOptional()
  @IsString()
  @IsEnum(EPrjStatus)
  @IsOptional()
  status: EPrjStatus

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
