// Auth interfaces

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  user_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}