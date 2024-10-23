import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "src/common/pagination-query.dto";
import { EBoolean } from "src/constants/boolean.enum";

export class UserPaginationDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstname: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastname: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(EBoolean)
  approved: EBoolean
}