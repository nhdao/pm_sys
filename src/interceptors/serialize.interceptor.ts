/* eslint-disable @typescript-eslint/no-empty-object-type */
import { NestInterceptor,
  ExecutionContext, CallHandler,
  UseInterceptors } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { plainToInstance } from "class-transformer";

interface ClassConstructor {
  new (...args: any[]): {}
}

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto))
}  

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
  //Run sth before the request is handled by the req handler
  // console.log('Before')

  return next.handle().pipe(
  map((data: any) => {
  //Run sth after the response is sent out
      return plainToInstance(this.dto, data, {
        excludeExtraneousValues: true
      })
    })
  )}
}