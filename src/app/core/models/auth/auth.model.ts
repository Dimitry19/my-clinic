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
