// Auth interfaces

export interface SignUpRequest {
  email: string;
  password: string;
  full_name: string;
  user_name: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}