/* eslint-disable @typescript-eslint/no-unused-vars */

import { IsArray, IsDate, IsEmail, IsEnum, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { EGender } from "src/constants/gender.enum";

export class CreateUserDto {
    
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string
  
  @ApiProperty()
  @IsString()
  password: string
  
  @ApiProperty()
  @IsString()
  phone: string
  
  @ApiProperty()
  @IsString()
  firstname: string
  
  @ApiProperty()
  @IsString()
  lastname: string
  
  @ApiProperty()
    
  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  techIds: number[]
    
  @ApiProperty()
  @IsString()
  @IsEnum(EGender)
  EGender: EGender
  
  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  dob: Date
  
  @ApiProperty()
  @IsString()
  address: string
  
  @ApiProperty()
  @IsString()
  identity: string
  
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  yoe: number
  
  @ApiProperty()
  @IsString()
  language: string
  
  @ApiProperty()
  @IsString()
  cert: string
}
