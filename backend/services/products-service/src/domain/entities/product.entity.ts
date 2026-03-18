export interface ProductProps {
    id: string;
    name: string;
    description: string;
    price: number;
    category: ProductCategory;
    imageUrl: string | null;
    isAvailable: boolean;
    preparationTime: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum ProductCategory {
    MEAL = 'meal',
    DRINK = 'drink',
    DESSERT = 'dessert',
    SIDE = 'side',
  }
  
  export class Product {
    private readonly props: ProductProps;
  
    constructor(props: ProductProps) {
      this.props = props;
    }
  
    get id(): string {
      return this.props.id;
    }
  
    get name(): string {
      return this.props.name;
    }
  
    get description(): string {
      return this.props.description;
    }
  
    get price(): number {
      return this.props.price;
    }
  
    get category(): ProductCategory {
      return this.props.category;
    }
  
    get imageUrl(): string | null {
      return this.props.imageUrl;
    }
  
    get isAvailable(): boolean {
      return this.props.isAvailable;
    }
  
    get preparationTime(): number {
      return this.props.preparationTime;
    }
  
    get createdAt(): Date {
      return this.props.createdAt;
    }
  
    get updatedAt(): Date {
      return this.props.updatedAt;
    }
  
    toJSON(): ProductProps {
      return {
        id: this.props.id,
        name: this.props.name,
        description: this.props.description,
        price: this.props.price,
        category: this.props.category,
        imageUrl: this.props.imageUrl,
        isAvailable: this.props.isAvailable,
        preparationTime: this.props.preparationTime,
        createdAt: this.props.createdAt,
        updatedAt: this.props.updatedAt,
      };
    }
  }