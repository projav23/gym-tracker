export type Goal = 'strength' | 'hypertrophy' | 'endurance';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'obliques';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'bands'
  | 'other';

export interface User {
  id: string;
  name: string;
  weight: number;
  height: number;
  birthDate?: string;
  goal: Goal;
  createdAt: string;
  weightHistory: WeightEntry[];
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment;
  instructions?: string;
  isCustom: boolean;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number;
  restSeconds: number;
  targetWeight?: number;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSet {
  reps: number;
  weight: number;
  rpe?: number;
  completed: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  routineId: string;
  routineName: string;
  date: string;
  duration: number;
  exercises: WorkoutExercise[];
  notes?: string;
}

export type SuggestionType = 'increase' | 'maintain' | 'decrease' | 'deload';

export interface WeightSuggestion {
  type: SuggestionType;
  amount?: number;
  suggestedWeight: number;
  reason: string;
}
