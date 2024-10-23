import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsOptional, IsString, Validate } from "class-validator";
import { PaginationQueryDto } from "src/common/pagination-query.dto";
import { PrjStatus } from "src/constants/project-status";
import { PrjType } from "src/constants/project-type.enum";
import { IsAfter } from "src/decorators/date-validation.decorator";

export class ProjectPaginationDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(PrjType)
  type: PrjType


  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(PrjStatus)
  status: PrjStatus

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startFrom: Date

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @Validate(IsAfter, ['startFrom'])
  startTo: Date
}