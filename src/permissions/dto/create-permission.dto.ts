import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { Method } from "src/constants/method.enum";

export class CreatePermissionDto {
  @ApiProperty()
  @IsString()
  @IsEnum(Method)
  method: string;

  @ApiProperty()
  @IsString()
  api_path: string;
}
