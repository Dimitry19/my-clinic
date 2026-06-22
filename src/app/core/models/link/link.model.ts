export enum ServiceLink {
  delivery = '/delivery',
  tracking = '/tracking',
  pickup = '/pickup',
  delivered = '/confirm',
  confirmPickup = '/confirm_pickup',
  auth = '/auth',
}

export class FooterPartElement {
  target: string = '_blank';

  hover: boolean = false;
}
