import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../services/i18n.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // impure pour réagir aux changements de langue
})
export class TranslatePipe implements PipeTransform {
  private i18n = inject(I18nService);

  transform(key: string, params?: Record<string, string | number>): string {
    console.log('Key et Value', key, this.i18n.translate(key, params));
    return this.i18n.translate(key, params);
  }
}
