import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber } from "class-validator";

export class AssignUserDto {
  @ApiProperty({ type: [Number] })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({} ,{ each: true })
  userIds: number[]
}