import { UUID } from 'crypto';

export interface User {
  id: UUID;
  nom: string;
  prenom: string;
  email: string;
  role:
    | 'ADMIN'
    | 'MEDECIN'
    | 'INFIRMIER'
    | 'LABORANTIN'
    | 'COMPTABLE'
    | 'RECEPTIONNISTE';
  avatar?: string;
}

export interface Authenticate {
  email: string;
  password: string;
}
