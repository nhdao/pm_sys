import { Exclude, Expose } from "class-transformer";

export class ProjectResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  budget: string;

  @Expose()
  type: string;

  @Expose()
  status: string;

  @Expose()
  created_date: Date;

  @Expose()
  start_date: Date;

  @Expose()
  due_date: Date;

  @Exclude()
  deletedAt: Date;
}