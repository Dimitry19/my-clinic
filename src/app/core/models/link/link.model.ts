export enum ServiceLink {
  delivery = '/delivery',
  tracking = '/tracking',
  pickup = '/pickup',
  delivered = '/confirm',
  confirmPickup = '/confirm_pickup',
  auth = '/auth',
}

export class FooterPartElement{
     label:string;
     target:string="_blank";
     link:string;
     iconUrl:string;
     hover:boolean=false;
}