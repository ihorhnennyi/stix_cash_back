import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class SanitizeDtoPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    delete value.balance;
    delete value.balanceBTC;

    return value;
  }
}
