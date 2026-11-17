import { Pipe, PipeTransform } from '@angular/core';
import { formatIst } from '../../core/utils/ist-date';

@Pipe({ name: 'istDate', standalone: true })
export class IstDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string { return formatIst(value); }
}
