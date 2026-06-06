import { HttpHeaders } from '@angular/common/http';

export class HeaderService {
  headersTextPlain = new HttpHeaders().append('Content-Type', 'text/plain');
  headers = new HttpHeaders().append(
    'Content-Type',
    'application/json-patch+json',
  );
}
