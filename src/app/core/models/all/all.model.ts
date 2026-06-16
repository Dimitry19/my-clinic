export interface ServiceError {
  code:
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'NETWORK'
    | 'SERVER'
    | 'FORBIDDEN'
    | 'UNKNOWN';
  message: string;
  field?: string;
}

export interface StatDashboard {
  patientsAujourdhui: number;
  enAttente: number;
  rdvRestants: number;
  consultationsTerminees: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type LoginStep = 'idle' | 'loading' | 'success' | 'error';
export type ErrorType = 'credentials' | 'network' | 'locked' | 'server' | null;
