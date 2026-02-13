import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Routine, RoutineExercise, Exercise } from '@/types';
import { zustandStorage } from '@/services/storage';
import { defaultExercises } from '@/constants/exercises';

interface RoutineState {
  routines: Routine[];
  exercises: Exercise[];
  addRoutine: (name: string, description?: string) => string;
  updateRoutine: (id: string, updates: Partial<Omit<Routine, 'id' | 'createdAt'>>) => void;
  deleteRoutine: (id: string) => void;
  addExerciseToRoutine: (routineId: string, exercise: Omit<RoutineExercise, 'id'>) => void;
  updateRoutineExercise: (routineId: string, exerciseId: string, updates: Partial<RoutineExercise>) => void;
  removeExerciseFromRoutine: (routineId: string, exerciseId: string) => void;
  reorderExercises: (routineId: string, exercises: RoutineExercise[]) => void;
  addCustomExercise: (exercise: Omit<Exercise, 'id' | 'isCustom'>) => string;
  getExerciseById: (id: string) => Exercise | undefined;
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      routines: [],
      exercises: defaultExercises,

      addRoutine: (name, description) => {
        const now = new Date().toISOString();
        const id = uuidv4();
        const routine: Routine = {
          id,
          name,
          description,
          exercises: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ routines: [...state.routines, routine] }));
        return id;
      },

      updateRoutine: (id, updates) => {
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === id
              ? { ...r, ...updates, updatedAt: new Date().toISOString() }
              : r
          ),
        }));
      },

      deleteRoutine: (id) => {
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
        }));
      },

      addExerciseToRoutine: (routineId, exercise) => {
        const exerciseWithId: RoutineExercise = {
          ...exercise,
          id: uuidv4(),
        };
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === routineId
              ? {
                  ...r,
                  exercises: [...r.exercises, exerciseWithId],
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      updateRoutineExercise: (routineId, exerciseId, updates) => {
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === routineId
              ? {
                  ...r,
                  exercises: r.exercises.map((e) =>
                    e.id === exerciseId ? { ...e, ...updates } : e
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      removeExerciseFromRoutine: (routineId, exerciseId) => {
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === routineId
              ? {
                  ...r,
                  exercises: r.exercises.filter((e) => e.id !== exerciseId),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      reorderExercises: (routineId, exercises) => {
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === routineId
              ? { ...r, exercises, updatedAt: new Date().toISOString() }
              : r
          ),
        }));
      },

      addCustomExercise: (exercise) => {
        const id = uuidv4();
        const newExercise: Exercise = {
          ...exercise,
          id,
          isCustom: true,
        };
        set((state) => ({
          exercises: [...state.exercises, newExercise],
        }));
        return id;
      },

      getExerciseById: (id) => {
        return get().exercises.find((e) => e.id === id);
      },
    }),
    {
      name: 'routine-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
