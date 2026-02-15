import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as Crypto from 'expo-crypto';
import { Workout, WorkoutExercise, WorkoutSet } from '@/types';
import { zustandStorage } from '@/services/storage';

interface ActiveWorkout {
  routineId: string;
  routineName: string;
  startTime: string;
  exercises: WorkoutExercise[];
  currentExerciseIndex: number;
}

interface WorkoutState {
  workouts: Workout[];
  activeWorkout: ActiveWorkout | null;
  startWorkout: (routineId: string, routineName: string, exerciseIds: string[]) => void;
  updateSet: (exerciseIndex: number, setIndex: number, updates: Partial<WorkoutSet>) => void;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  nextExercise: () => void;
  previousExercise: () => void;
  goToExercise: (index: number) => void;
  finishWorkout: (notes?: string) => string | null;
  cancelWorkout: () => void;
  getWorkoutsByExercise: (exerciseId: string) => Workout[];
  getLastWorkoutForExercise: (exerciseId: string) => WorkoutExercise | null;
  getPersonalRecord: (exerciseId: string) => { weight: number; reps: number; date: string } | null;
  resetWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      workouts: [],
      activeWorkout: null,

      startWorkout: (routineId, routineName, exerciseIds) => {
        const exercises: WorkoutExercise[] = exerciseIds.map((id) => ({
          exerciseId: id,
          sets: [{ reps: 0, weight: 0, completed: false }],
        }));

        set({
          activeWorkout: {
            routineId,
            routineName,
            startTime: new Date().toISOString(),
            exercises,
            currentExerciseIndex: 0,
          },
        });
      },

      updateSet: (exerciseIndex, setIndex, updates) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        const newExercises = [...activeWorkout.exercises];
        newExercises[exerciseIndex] = {
          ...newExercises[exerciseIndex],
          sets: newExercises[exerciseIndex].sets.map((s, i) =>
            i === setIndex ? { ...s, ...updates } : s
          ),
        };

        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: newExercises,
          },
        });
      },

      addSet: (exerciseIndex) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        const newExercises = [...activeWorkout.exercises];
        const lastSet = newExercises[exerciseIndex].sets.at(-1);
        newExercises[exerciseIndex] = {
          ...newExercises[exerciseIndex],
          sets: [
            ...newExercises[exerciseIndex].sets,
            {
              reps: lastSet?.reps ?? 0,
              weight: lastSet?.weight ?? 0,
              completed: false,
            },
          ],
        };

        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: newExercises,
          },
        });
      },

      removeSet: (exerciseIndex, setIndex) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;

        const newExercises = [...activeWorkout.exercises];
        if (newExercises[exerciseIndex].sets.length <= 1) return;

        newExercises[exerciseIndex] = {
          ...newExercises[exerciseIndex],
          sets: newExercises[exerciseIndex].sets.filter((_, i) => i !== setIndex),
        };

        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: newExercises,
          },
        });
      },

      nextExercise: () => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        if (activeWorkout.currentExerciseIndex >= activeWorkout.exercises.length - 1) return;

        set({
          activeWorkout: {
            ...activeWorkout,
            currentExerciseIndex: activeWorkout.currentExerciseIndex + 1,
          },
        });
      },

      previousExercise: () => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        if (activeWorkout.currentExerciseIndex <= 0) return;

        set({
          activeWorkout: {
            ...activeWorkout,
            currentExerciseIndex: activeWorkout.currentExerciseIndex - 1,
          },
        });
      },

      goToExercise: (index) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        if (index < 0 || index >= activeWorkout.exercises.length) return;

        set({
          activeWorkout: {
            ...activeWorkout,
            currentExerciseIndex: index,
          },
        });
      },

      finishWorkout: (notes) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return null;

        const endTime = new Date();
        const startTime = new Date(activeWorkout.startTime);
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

        const id = Crypto.randomUUID();
        const workout: Workout = {
          id,
          routineId: activeWorkout.routineId,
          routineName: activeWorkout.routineName,
          date: activeWorkout.startTime,
          duration,
          exercises: activeWorkout.exercises,
          notes,
        };

        set((state) => ({
          workouts: [...state.workouts, workout],
          activeWorkout: null,
        }));

        return id;
      },

      cancelWorkout: () => {
        set({ activeWorkout: null });
      },

      getWorkoutsByExercise: (exerciseId) => {
        return get().workouts.filter((w) =>
          w.exercises.some((e) => e.exerciseId === exerciseId)
        );
      },

      getLastWorkoutForExercise: (exerciseId) => {
        const workouts = get().workouts
          .filter((w) => w.exercises.some((e) => e.exerciseId === exerciseId))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (workouts.length === 0) return null;

        return workouts[0].exercises.find((e) => e.exerciseId === exerciseId) ?? null;
      },

      getPersonalRecord: (exerciseId) => {
        const workouts = get().workouts;
        let record: { weight: number; reps: number; date: string } | null = null;

        for (const workout of workouts) {
          const exercise = workout.exercises.find((e) => e.exerciseId === exerciseId);
          if (!exercise) continue;

          for (const set of exercise.sets) {
            if (!set.completed) continue;
            if (!record || set.weight > record.weight) {
              record = { weight: set.weight, reps: set.reps, date: workout.date };
            }
          }
        }

        return record;
      },
      resetWorkout: async () => {
        // 1. limpiar memoria
        set({ workouts: [], activeWorkout: null });

        // 2. limpiar persistencia
        await useWorkoutStore.persist.clearStorage();
      }
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
