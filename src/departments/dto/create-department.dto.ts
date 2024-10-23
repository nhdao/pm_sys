import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsString } from "class-validator";

export class CreateDepartmentDto {
  @ApiProperty()
  @IsString()
  name:string

  @ApiProperty()
  @IsString()
  description:string

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  founded_date: Date
}
