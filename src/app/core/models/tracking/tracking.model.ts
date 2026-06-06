import { DeliveryStatus } from '../enums/enums.model';

export class TrackingDTO {
  public parcelCode: string;
}

export class TrackingStep {
  public status: DeliveryStatus;
  public date: string;
  public position: string;
  public active: boolean;
}

export class Tracking extends TrackingDTO {
  public owner: string;
  public travelDate: string;
  public steps: TrackingStep[];
}

// Définir l'ordre des statuts
export const STATUS_ORDER = [
  'GENERATED',
  'INSERTED',
  'STARTED',
  'STOPOVER',
  'IN_PROGRESS',
  'DELIVERED',
];
