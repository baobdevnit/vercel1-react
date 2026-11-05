/**
 * TypeScript Contracts chuẩn hóa từ backend render1-api (NestJS + Supabase + JWT)
 * Tham chiếu: docs/FRONTEND_HANDOVER.md
 */

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  token_type: 'Bearer';
  user: User;
}

export interface LogoutResponse {
  message: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface HealthCheckItem {
  componentId: string;
  componentType: string;
  status: 'pass' | 'warn' | 'fail';
  observedValue?: number | string;
  observedUnit?: string;
  time: string;
  output?: string;
}

export interface HealthResponse {
  status: 'pass' | 'warn' | 'fail';
  version: string;
  releaseId: string;
  notes?: string[];
  serviceId: string;
  description: string;
  checks: Record<string, HealthCheckItem[]>;
  links?: Record<string, string>;
}
