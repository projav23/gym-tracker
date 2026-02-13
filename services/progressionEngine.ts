import { WorkoutSet, WeightSuggestion, Exercise, MuscleGroup } from '@/types';

const COMPOUND_EXERCISES: MuscleGroup[] = ['chest', 'back', 'quadriceps', 'glutes'];
const COMPOUND_INCREMENT = 2.5;
const ISOLATION_INCREMENT = 1.25;

interface WorkoutHistory {
  date: string;
  sets: WorkoutSet[];
}

export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function calculateVolume(sets: WorkoutSet[]): number {
  return sets
    .filter((s) => s.completed)
    .reduce((acc, set) => acc + set.weight * set.reps, 0);
}

function getWeightIncrement(exercise: Exercise): number {
  return COMPOUND_EXERCISES.includes(exercise.muscleGroup)
    ? COMPOUND_INCREMENT
    : ISOLATION_INCREMENT;
}

function averageRPE(history: WorkoutHistory[]): number {
  const allSets = history.flatMap((h) => h.sets);
  const setsWithRPE = allSets.filter((s) => s.rpe !== undefined && s.completed);
  if (setsWithRPE.length === 0) return 7;
  return setsWithRPE.reduce((acc, s) => acc + (s.rpe ?? 0), 0) / setsWithRPE.length;
}

function allSetsCompleted(history: WorkoutHistory[]): boolean {
  return history.every((h) => h.sets.every((s) => s.completed));
}

function getLastWeight(history: WorkoutHistory[]): number {
  if (history.length === 0) return 0;
  const lastWorkout = history[0];
  const completedSets = lastWorkout.sets.filter((s) => s.completed);
  if (completedSets.length === 0) return 0;
  return Math.max(...completedSets.map((s) => s.weight));
}

function weeksSinceDeload(history: WorkoutHistory[]): number {
  if (history.length < 2) return 0;
  const now = new Date();
  let weeks = 0;
  let foundDeload = false;

  for (let i = 1; i < history.length; i++) {
    const currentWeight = getLastWeight([history[i - 1]]);
    const previousWeight = getLastWeight([history[i]]);
    if (currentWeight < previousWeight * 0.9) {
      foundDeload = true;
      break;
    }
    const daysDiff = Math.abs(
      (now.getTime() - new Date(history[i].date).getTime()) / (1000 * 60 * 60 * 24)
    );
    weeks = Math.floor(daysDiff / 7);
  }

  return foundDeload ? 0 : weeks;
}

export function suggestWeight(
  exercise: Exercise,
  targetReps: number,
  history: WorkoutHistory[]
): WeightSuggestion {
  if (history.length === 0) {
    return {
      type: 'maintain',
      suggestedWeight: 0,
      reason: 'Sin historial. Empieza con un peso que te permita completar todas las repeticiones con buena técnica.',
    };
  }

  const lastWeight = getLastWeight(history);
  const increment = getWeightIncrement(exercise);
  const recentHistory = history.slice(0, 3);
  const avgRPE = averageRPE(recentHistory);
  const weeksWithoutDeload = weeksSinceDeload(history);

  if (weeksWithoutDeload >= 5) {
    const deloadWeight = Math.round((lastWeight * 0.9) / increment) * increment;
    return {
      type: 'deload',
      amount: -10,
      suggestedWeight: deloadWeight,
      reason: 'Semana de descarga recomendada para optimizar la recuperación.',
    };
  }

  if (recentHistory.length >= 2 && allSetsCompleted(recentHistory) && avgRPE < 8) {
    const newWeight = lastWeight + increment;
    return {
      type: 'increase',
      amount: increment,
      suggestedWeight: newWeight,
      reason: `Has completado todas las series consistentemente con RPE bajo. Sube ${increment}kg.`,
    };
  }

  if (avgRPE > 9) {
    return {
      type: 'maintain',
      suggestedWeight: lastWeight,
      reason: 'El esfuerzo percibido es alto. Mantén el peso y consolida antes de subir.',
    };
  }

  if (!allSetsCompleted(recentHistory)) {
    return {
      type: 'maintain',
      suggestedWeight: lastWeight,
      reason: 'Completa todas las series antes de aumentar el peso.',
    };
  }

  return {
    type: 'maintain',
    suggestedWeight: lastWeight,
    reason: 'Mantén el peso actual y sigue progresando.',
  };
}

export function estimateWorkoutDuration(exerciseCount: number, setsPerExercise: number): number {
  const avgSetTime = 1.5;
  const avgRestTime = 2;
  const transitionTime = 1;
  const totalSets = exerciseCount * setsPerExercise;
  return Math.round(totalSets * (avgSetTime + avgRestTime) + exerciseCount * transitionTime);
}

export function getStreak(workoutDates: string[]): number {
  if (workoutDates.length === 0) return 0;

  const sortedDates = workoutDates
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastWorkout = new Date(sortedDates[0]);
  lastWorkout.setHours(0, 0, 0, 0);

  const daysSinceLastWorkout = Math.floor(
    (today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastWorkout > 2) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i - 1]);
    const previous = new Date(sortedDates[i]);
    current.setHours(0, 0, 0, 0);
    previous.setHours(0, 0, 0, 0);

    const diff = Math.floor(
      (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff <= 2) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
