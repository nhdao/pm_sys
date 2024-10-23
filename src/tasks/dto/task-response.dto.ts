import { Expose } from "class-transformer";

export class TaskResponseDto {
  @Expose()
  id: number;

  @Expose()
  description: string;

  @Expose()
  assigned_date: Date

  @Expose()
  deadline: Date

  @Expose()
  done: boolean
}