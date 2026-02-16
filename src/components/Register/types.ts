export type ServiceType = 
  | 'league' 
  | 'training' 
  | 'camps' 
  | 'birthday'
  | 'pickup'
  | 'fieldRental';

export interface RegistrationFormData {
  [key: string]: string | number | string[];
}

export interface ServiceConfig {
  type: ServiceType;
  title: string;
  subtitle: string;
  component: React.ComponentType;
}
