export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  push_notification_permission: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  message: string;
  user: User;
}

export interface ApiError {
  error: string;
  message: string;
}

