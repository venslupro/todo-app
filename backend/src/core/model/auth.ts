export interface User {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string | null;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  session: Session;
}