import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { EMethod } from "src/constants/method.enum";

export class CreatePermissionDto {
  @ApiProperty()
  @IsString()
  @IsEnum(EMethod)
  method: string;

  @ApiProperty()
  @IsString()
  api_path: string;
}
