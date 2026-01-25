export interface RegistrationRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  pin?: string;
}