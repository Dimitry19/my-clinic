import { Injectable } from '@angular/core';

import { ApiResponse } from './api-response.model';
import { HeaderService } from '../../services/headers.service';

@Injectable({
  providedIn: 'root',
})
export class ApiResponseService extends HeaderService {
  public isSuccessResponse(response: ApiResponse): boolean {
    return (
      response != null &&
      typeof response != 'string' &&
      response.success === true
    );
  }

  public isErrorResponse(response: ApiResponse): boolean {
    return !this.isSuccessResponse(response);
  }
}
