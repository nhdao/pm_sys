import { IsDate, IsEnum, IsNumber, IsString, Validate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsAfter } from "src/decorators/date-validation.decorator";
import { PrjType } from "src/constants/project-type.enum";
import { IsAfterNow } from "src/decorators/is-after-now.decoratior";

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  budget: string;

  @ApiProperty()
  @IsString()
  @IsEnum(PrjType)
  type: PrjType

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  @Validate(IsAfterNow, [new Date()])
  start_date: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  @Validate(IsAfter, ['start_date'])
  due_date: Date;

  @ApiProperty({ type: Number })
  @IsNumber()
  clientId: number; 
  
  @ApiProperty({ type: Number })
  @IsNumber()
  departmentId: number;  
}

