import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsBoolean, IsNotEmpty, IsNumber } from "class-validator";

export class UserApprovalDto {
  @ApiProperty({ type: [Number] })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({} ,{ each: true })
  userIds: number[];

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  approved: boolean
}