
export type Role = 'host' | 'user';

export interface HealthMetric {
  id: string;
  userId: string;
  date: string;
  steps?: number;
  heartRate?: number;
  caloriesBurned?: number;
  sleepHours?: number;
  distanceKm?: number;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  dateOfBirth?: string; // ISO 8601 date format
  height?: number; // in cm
  weight?: number; // in kg
  gpsLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  latestHealthMetric?: HealthMetric | null;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  duration?: string;
  rest?: string;
  notes?: string;
}

export interface Workout {
  id: string;
  title: string;
  day: string; // e.g., "Monday"
  exercises: Exercise[];
}

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  hostId: string;
  workouts: Workout[];
  assignedUserIds: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationWeeks: number;
}

export interface CompletionRecord {
  id: string;
  userId: string;
  workoutId: string;
  programId: string;
  date: string;
  completed: boolean;
  notes?: string;
}

export interface ProgressData {
  date: string;
  completions: number;
}
