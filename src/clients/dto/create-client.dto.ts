import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;
}
