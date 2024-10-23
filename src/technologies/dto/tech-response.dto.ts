import { Expose } from "class-transformer";

export class TechResponseDto {
  @Expose()
  name: string;
}