export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  registeredEvents?: string[]; // Array of event IDs the user has registered for
}

export interface AuthResponse {
  user: User;
  token: string;
} 