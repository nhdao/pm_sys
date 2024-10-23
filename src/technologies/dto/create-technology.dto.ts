import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateTechnologyDto {
  @ApiProperty()
  @IsString()
  name: string;
}
