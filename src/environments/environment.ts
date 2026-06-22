import { ClinicTrinityEnvironment } from './environment.model';

export const environment: ClinicTrinityEnvironment = {
  production: false,
  apiUrl: 'http://localhost:8080/trinity/api',
  authUrl: 'http://localhost:8080/trinity/api/auth',
  hostUrl: 'https://parcel-demo.travelpostservices.eu',
  mobileFeatureUrl: 'https://mobiles-apps-features.vercel.app/admin/file',
  context: '/trinity',
  fakePatientId: '12020d5sd00ds-sds1d5158dsd-1d1sd85d12sd-1s1dsdsd',

  inProgressIconUrl: '/assets/images/tracking/delivery-step.jpg',
  insertedIconUrl: '/assets/images/tracking/inserted-step.png',
  stopOverIconUrl: '/assets/images/tracking/room_time_waiting.png',
  startedIconUrl: '/assets/images/tracking/taking-off-plane-step.jpg',
  generatedIconUrl: '/assets/images/tracking/generated-step.png',
  defaultIconUrl: '/assets/images/pd_logo_sm.png',
  authpages: [1, 2, 3],
  spinners: [1, 2],
  progressbars: [1, 2, 3, 4, 5, 6],
};
