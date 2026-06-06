export class CommonDelivery{
    public travelCode:string
    public parcelCode:string
}

export class DeliveryDTO extends CommonDelivery{
    public username:string
   
}

export class Delivery extends CommonDelivery{
    public owner:string
    public travelDate:string
}




export class PickupDTO {
    public travelCode:string
    public username:string
   
}