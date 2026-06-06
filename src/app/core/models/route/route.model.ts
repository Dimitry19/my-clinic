export interface RoureUrl {
  delivery: string;
  tracking: string;
  pickup: string;
  auth: string;
  notFound: string;
  error: string;
  errorType: string;
  unauthorized: string;
  unknown: string;
  forgotPassword: string;
  profile: string;
}

export const ClinicTrinityRouteUrl: RoureUrl = {
  delivery: 'delivery',
  tracking: 'tracking',
  pickup: 'pickup',
  auth: 'authenticate',
  notFound: 'not-found',
  forgotPassword: 'forgot-password',
  profile: 'profile-user',
  error: 'error',
  errorType: 'error/:type',
  unauthorized: 'unauthorized',
  unknown: '**',
};
