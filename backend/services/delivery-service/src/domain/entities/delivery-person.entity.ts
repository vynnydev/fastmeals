export interface DeliveryPersonProps {
    id: string;
    name: string;
    phone: string;
    vehicleType: VehicleType;
    isActive: boolean;
    currentLatitude: number | null;
    currentLongitude: number | null;
    createdAt: Date;
}
  
export enum VehicleType {
    BICYCLE = 'bicycle',
    MOTORCYCLE = 'motorcycle',
    CAR = 'car',
}
  
export class DeliveryPerson {
    private readonly props: DeliveryPersonProps;
  
    constructor(props: DeliveryPersonProps) {
      this.props = props;
    }
  
    get id(): string {
      return this.props.id;
    }
  
    get name(): string {
      return this.props.name;
    }
  
    get phone(): string {
      return this.props.phone;
    }
  
    get vehicleType(): VehicleType {
      return this.props.vehicleType;
    }
  
    get isActive(): boolean {
      return this.props.isActive;
    }
  
    get currentLatitude(): number | null {
      return this.props.currentLatitude;
    }
  
    get currentLongitude(): number | null {
      return this.props.currentLongitude;
    }
  
    get createdAt(): Date {
      return this.props.createdAt;
    }
  
    hasLocation(): boolean {
      return this.props.currentLatitude !== null && this.props.currentLongitude !== null;
    }
  
    toJSON(): DeliveryPersonProps & { currentOrderId: string | null } {
      return {
        ...this.props,
        currentOrderId: null, // Will be populated by the controller when needed
      };
    }
}