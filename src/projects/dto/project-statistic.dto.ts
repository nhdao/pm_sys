import { IsDate, IsEnum, IsOptional, IsString } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { EPrjStatus } from "src/constants/project-status"
import { EPrjType } from "src/constants/project-type.enum"

export class ProjectStatisticDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(EPrjType)
  type: EPrjType 

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsEnum(EPrjStatus)
  status?: EPrjStatus = EPrjStatus.INPROGESS

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