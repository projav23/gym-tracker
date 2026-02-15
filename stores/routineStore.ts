import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as Crypto from 'expo-crypto';
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
  updateExercise: (id: string, updates: Partial<Omit<Exercise, 'id' | 'isCustom'>>) => void;
  deleteExercise: (id: string) => boolean;
  getExerciseById: (id: string) => Exercise | undefined;
  resetRoutines: () => void;
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      routines: [],
      exercises: defaultExercises,

      addRoutine: (name, description) => {
        const now = new Date().toISOString();
        const id = Crypto.randomUUID();
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
          id: Crypto.randomUUID(),
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
        const id = Crypto.randomUUID();
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

      updateExercise: (id, updates) => {
        const exercise = get().exercises.find((e) => e.id === id);
        if (!exercise || !exercise.isCustom) return;
        set((state) => ({
          exercises: state.exercises.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));
      },

      deleteExercise: (id) => {
        const exercise = get().exercises.find((e) => e.id === id);
        if (!exercise || !exercise.isCustom) return false;
        const isUsed = get().routines.some((r) =>
          r.exercises.some((e) => e.exerciseId === id)
        );
        if (isUsed) return false;
        set((state) => ({
          exercises: state.exercises.filter((e) => e.id !== id),
        }));
        return true;
      },

      getExerciseById: (id) => {
        return get().exercises.find((e) => e.id === id);
      },
      resetRoutines: async () => {
        // 1. limpiar memoria
        set({ routines: [], exercises: defaultExercises, });

        // 2. limpiar persistencia
        await useRoutineStore.persist.clearStorage();
      }
    }),
    {
      name: 'routine-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
