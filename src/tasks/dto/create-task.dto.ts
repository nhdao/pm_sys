import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsDate, IsNumber, IsString, Validate } from "class-validator"
import { IsAfterNow } from "src/decorators/is-after-now.decoratior"

export class CreateTaskDto {

  @ApiProperty()
  @IsString()
  description: string

  @ApiProperty({ type: Number })
  @IsNumber()
  userId: number

  @ApiProperty({ type: Number })
  @IsNumber()
  projectId: number

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  @Validate(IsAfterNow, [new Date()])
  deadline: Date
}
