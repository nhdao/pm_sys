import { IsDate, IsEnum, IsOptional, IsString } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { PrjStatus } from "src/constants/project-status"
import { PrjType } from "src/constants/project-type.enum"

export class ProjectStatisticDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(PrjType)
  type: PrjType 

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsEnum(PrjStatus)
  status?: PrjStatus = PrjStatus.INPROGESS

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  techId: string

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  clientId: string

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_date: Date
}