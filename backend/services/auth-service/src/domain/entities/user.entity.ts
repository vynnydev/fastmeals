export interface UserProps {
    id: string;
    email: string;
    password: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export enum UserRole {
    ADMIN = 'admin',
    VIEWER = 'viewer',
  }
  
export class User {
  private readonly props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  isViewer(): boolean {
    return this.props.role === UserRole.VIEWER;
  }
  
  toJSON(): Omit<UserProps, 'password'> {
    return {
        id: this.props.id,
        email: this.props.email,
        role: this.props.role,
        createdAt: this.props.createdAt,
        updatedAt: this.props.updatedAt,
    };
  }
}