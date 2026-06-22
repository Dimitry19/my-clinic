export interface ClinicTrinityEnvironment {
  production: boolean;
  apiUrl: string;
  authUrl: string;
  hostUrl: string;
  mobileFeatureUrl: string;
  context: string;
  fakePatientId: string;
  dashboardRoles: string[];
  patientsRoles: string[];
  agendaRoles: string[];
  adminRoles: string[];
  laboratoireRoles: string[];
  pharmacieRoles: string[];
  facturationRoles: string[];
  ressourcesHumainesRoles: string[];

  inProgressIconUrl: string;
  insertedIconUrl: string;
  stopOverIconUrl: string;
  startedIconUrl: string;
  generatedIconUrl: string;
  defaultIconUrl: string;
  authpages: number[];
  spinners: number[];
  progressbars: number[];
}
