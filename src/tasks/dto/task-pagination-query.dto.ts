import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsOptional, IsString, Validate } from "class-validator";
import { PaginationQueryDto } from "src/common/pagination-query.dto";
import { EBoolean } from "src/constants/boolean.enum";
import { IsAfter } from "src/decorators/date-validation.decorator";

export class TaskPaginationDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(EBoolean)
  done: EBoolean

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dlFrom: Date

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @Validate(IsAfter, ['dlFrom'])
  dlTo: Date
}