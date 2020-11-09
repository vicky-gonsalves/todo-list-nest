import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate, ValidatorOptions } from 'class-validator';
import { plainToClass } from 'class-transformer';

const validatorOptions: ValidatorOptions = {
  skipMissingProperties: false,
  skipUndefinedProperties: false,
  skipNullProperties: false,
  whitelist: true,
  forbidNonWhitelisted: true,
  groups: [],
  dismissDefaultMessages: false,
  validationError: {
    target: true,
    value: true,
  },
  forbidUnknownValues: true,
};

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object, validatorOptions);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    return value;
  }

  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object, Date];
    return !types.includes(metatype);
  }
}
