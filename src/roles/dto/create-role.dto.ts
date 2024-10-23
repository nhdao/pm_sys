import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";

export class CreateRoleDto {

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;
  
  @ApiProperty({ type: [Number] })
  @IsArray({ message: "No permissions provided"})
  @IsNumber({}, { each: true })
  permissionIds: number[]
}
