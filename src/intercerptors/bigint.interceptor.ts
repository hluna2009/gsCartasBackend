import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  @Injectable()
  export class BigIntInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        map((data) => this.serializeBigInts(data)),
      );
    }
  
    private serializeBigInts(data: any): any {
      if (typeof data === 'bigint') {
        return data.toString(); // Convertir BigInt a string
      }
      if (Array.isArray(data)) {
        return data.map((item) => this.serializeBigInts(item)); // Recorrer arrays
      }
      if (typeof data === 'object' && data !== null) {
        const result = {};
        for (const key in data) {
          result[key] = this.serializeBigInts(data[key]); // Recorrer objetos
        }
        return result;
      }
      return data;
    }
  }