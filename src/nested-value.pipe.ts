import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'nestedValue' })
export class NestedValuePipe implements PipeTransform {
  transform(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc && acc[key], obj);
  }
}
