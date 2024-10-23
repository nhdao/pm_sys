import { Expose } from "class-transformer";


export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string

  @Expose()
  firstname: string

  @Expose()
  lastname: string

  @Expose()
  approved: boolean
}