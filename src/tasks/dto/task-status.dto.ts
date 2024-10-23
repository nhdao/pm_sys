import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNumber } from "class-validator";

export class TaskStatusDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  taskIds: number[];

  @ApiProperty()
  @IsBoolean()
  done: boolean;
}