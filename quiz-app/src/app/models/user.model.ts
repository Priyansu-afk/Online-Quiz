export interface User {
  id?: number;
  username: string;
  role?: string;
  token?: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}
