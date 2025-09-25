/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Core domain types
export type UserRole = "admin" | "coach" | "athlete";

export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  sport: string;
  age: number;
  avatarUrl?: string;
  videoUrl?: string;
  team?: string;
  metrics?: {
    speed?: number; // m/s
    endurance?: number; // 0-100
    strength?: number; // 0-100
  };
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface ListResponse<T> {
  items: T[];
  total: number;
}
