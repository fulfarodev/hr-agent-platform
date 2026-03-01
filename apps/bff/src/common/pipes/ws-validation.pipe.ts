import { PipeTransform, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { validate } from 'class-validator';

@Injectable()
export class WsValidationPipe implements PipeTransform {
  constructor(private readonly dtoClass: new () => any) {}

  async transform(value: unknown) {
    if (typeof value !== 'object' || value === null) {
      throw new WsException('Invalid payload: expected an object');
    }

    const instance = Object.assign(new this.dtoClass(), value);
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const messages = errors
        .flatMap((e) => Object.values(e.constraints ?? {}))
        .join('; ');
      throw new WsException(`Validation failed: ${messages}`);
    }

    return instance;
  }
}
