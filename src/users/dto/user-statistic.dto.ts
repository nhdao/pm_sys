import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"

export class UserStatisticDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  techId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId: string
}