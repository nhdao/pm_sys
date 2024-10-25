import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsOptional, IsString, Validate } from "class-validator";
import { PaginationQueryDto } from "src/common/pagination-query.dto";
import { EPrjStatus } from "src/constants/project-status";
import { EPrjType } from "src/constants/project-type.enum";
import { IsAfter } from "src/decorators/date-validation.decorator";

export class ProjectPaginationDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(EPrjType)
  type: EPrjType

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(EPrjStatus)
  status: EPrjStatus

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