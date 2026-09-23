import { UUID } from 'crypto';

export interface User {
  id: UUID;
  employeId: UUID | null;
  nom: string;
  prenom: string;
  email: string;
  role:
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'MEDECIN'
    | 'INFIRMIER'
    | 'LABORANTIN'
    | 'COMPTABLE'
    | 'PHARMACIEN'
    | 'URGENTISTE'
    | 'RECEPTIONNISTE';
  avatar?: string;
}

export interface Authenticate {
  email: string;
  password: string;
}

export interface AuthUser {
  id: UUID;
  prenom: string;
  nom: string;
  email: string;
  employeId: UUID | null;
  roles: string[];
}

export const ROLES_METIER = [
  'SUPER_ADMIN',
  'ADMIN',
  'MEDECIN',
  'RECEPTIONNISTE',
  'INFIRMIER',
  'LABORANTIN',
  'COMPTABLE',
  'PATIENT',
  'PHARMACIEN',
  'URGENTISTE',
];
