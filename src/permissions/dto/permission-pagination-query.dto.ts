import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "src/common/pagination-query.dto";

export class PermissisonPaginationDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  method: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiPath: string
}