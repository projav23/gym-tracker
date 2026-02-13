import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Play,
  Pause,
  Check,
  ChevronLeft,
  ChevronRight,
  Timer,
  Lightbulb,
} from 'lucide-react-native';
import { Card, Button, Input } from '@/components/ui';
import { useRoutineStore } from '@/stores/routineStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { suggestWeight } from '@/services/progressionEngine';
import { colors } from '@/constants/Colors';

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routines, getExerciseById } = useRoutineStore();
  const {
    activeWorkout,
    workouts,
    startWorkout,
    updateSet,
    addSet,
    nextExercise,
    previousExercise,
    finishWorkout,
    cancelWorkout,
  } = useWorkoutStore();

  const routine = routines.find((r) => r.id === id);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeWorkout && activeWorkout.routineId === id) {
      setIsWorkoutActive(true);
    }
  }, [activeWorkout, id]);

  useEffect(() => {
    if (isResting && restTimer > 0) {
      timerRef.current = setTimeout(() => {
        setRestTimer(restTimer - 1);
      }, 1000);
    } else if (restTimer === 0 && isResting) {
      setIsResting(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isResting, restTimer]);

  if (!routine) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary items-center justify-center">
        <Text className="text-white">Rutina no encontrada</Text>
        <Button onPress={() => router.back()} variant="ghost">
          Volver
        </Button>
      </SafeAreaView>
    );
  }

  const handleStartWorkout = () => {
    const exerciseIds = routine.exercises.map((e) => e.exerciseId);
    startWorkout(routine.id, routine.name, exerciseIds);
    setIsWorkoutActive(true);
  };

  const handleCompleteSet = (setIndex: number) => {
    if (!activeWorkout) return;
    const currentExercise =
      activeWorkout.exercises[activeWorkout.currentExerciseIndex];
    const set = currentExercise.sets[setIndex];

    updateSet(activeWorkout.currentExerciseIndex, setIndex, {
      completed: !set.completed,
    });

    if (!set.completed) {
      const routineExercise = routine.exercises[activeWorkout.currentExerciseIndex];
      setRestTimer(routineExercise?.restSeconds || 90);
      setIsResting(true);
    }
  };

  const handleUpdateSetValue = (
    setIndex: number,
    field: 'weight' | 'reps' | 'rpe',
    value: string
  ) => {
    if (!activeWorkout) return;
    const numValue = parseFloat(value) || 0;
    updateSet(activeWorkout.currentExerciseIndex, setIndex, { [field]: numValue });
  };

  const handleFinishWorkout = () => {
    Alert.alert('Finalizar entrenamiento', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Finalizar',
        onPress: () => {
          finishWorkout(undefined);
          setIsWorkoutActive(false);
          router.back();
        },
      },
    ]);
  };

  const handleCancelWorkout = () => {
    Alert.alert(
      'Cancelar entrenamiento',
      'Perderás el progreso de este entrenamiento',
      [
        { text: 'Continuar', style: 'cancel' },
        {
          text: 'Cancelar entrenamiento',
          style: 'destructive',
          onPress: () => {
            cancelWorkout();
            setIsWorkoutActive(false);
          },
        },
      ]
    );
  };

  const currentExerciseIndex = activeWorkout?.currentExerciseIndex ?? 0;
  const currentRoutineExercise = routine.exercises[currentExerciseIndex];
  const currentExercise = currentRoutineExercise
    ? getExerciseById(currentRoutineExercise.exerciseId)
    : null;
  const currentWorkoutExercise = activeWorkout?.exercises[currentExerciseIndex];

  const getWeightSuggestion = () => {
    if (!currentExercise) return null;
    const exerciseWorkouts = workouts
      .filter((w) =>
        w.exercises.some((e) => e.exerciseId === currentExercise.id)
      )
      .map((w) => ({
        date: w.date,
        sets: w.exercises.find((e) => e.exerciseId === currentExercise.id)!.sets,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return suggestWeight(
      currentExercise,
      currentRoutineExercise?.reps ?? 10,
      exerciseWorkouts
    );
  };

  const suggestion = isWorkoutActive ? getWeightSuggestion() : null;

  // Preview mode (not in workout)
  if (!isWorkoutActive) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <View className="px-4 py-4 flex-row items-center gap-4">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft color={colors.text.primary} size={24} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">{routine.name}</Text>
            {routine.description && (
              <Text className="text-text-secondary">{routine.description}</Text>
            )}
          </View>
        </View>

        <ScrollView className="flex-1 px-4">
          <View className="gap-3">
            {routine.exercises.map((item, index) => {
              const exercise = getExerciseById(item.exerciseId);
              return (
                <Card key={item.id}>
                  <Text className="text-white font-semibold">
                    {index + 1}. {exercise?.name || 'Ejercicio'}
                  </Text>
                  <Text className="text-text-secondary mt-1">
                    {item.sets} series × {item.reps} reps • {item.restSeconds}s
                    descanso
                  </Text>
                </Card>
              );
            })}
          </View>
          <View className="h-32" />
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 p-4 bg-bg-primary border-t border-bg-tertiary">
          <Button
            onPress={handleStartWorkout}
            fullWidth
            size="lg"
            icon={<Play color={colors.bg.primary} size={24} />}
          >
            Comenzar Entrenamiento
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Active workout mode
  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="px-4 py-4 flex-row items-center justify-between">
        <Pressable onPress={handleCancelWorkout}>
          <Text className="text-error">Cancelar</Text>
        </Pressable>
        <Text className="text-white font-semibold">
          {currentExerciseIndex + 1} / {routine.exercises.length}
        </Text>
        <Pressable onPress={handleFinishWorkout}>
          <Text className="text-accent-primary font-semibold">Terminar</Text>
        </Pressable>
      </View>

      {/* Rest Timer */}
      {isResting && (
        <View className="mx-4 mb-4 bg-accent-primary/20 rounded-xl p-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Timer color={colors.accent.primary} size={24} />
            <Text className="text-accent-primary font-bold text-xl ml-3">
              {Math.floor(restTimer / 60)}:
              {(restTimer % 60).toString().padStart(2, '0')}
            </Text>
          </View>
          <Pressable onPress={() => setIsResting(false)}>
            <Text className="text-accent-primary">Saltar</Text>
          </Pressable>
        </View>
      )}

      <ScrollView className="flex-1 px-4">
        {/* Current Exercise */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-white">
            {currentExercise?.name}
          </Text>
          <Text className="text-text-secondary">
            {currentRoutineExercise?.sets} series × {currentRoutineExercise?.reps}{' '}
            reps
          </Text>
        </View>

        {/* Suggestion Card */}
        {suggestion && suggestion.suggestedWeight > 0 && (
          <Card className="mb-4 bg-accent-tertiary/20 border border-accent-tertiary/30">
            <View className="flex-row items-start">
              <Lightbulb color={colors.accent.tertiary} size={20} />
              <View className="ml-3 flex-1">
                <Text className="text-accent-tertiary font-semibold">
                  Peso sugerido: {suggestion.suggestedWeight} kg
                </Text>
                <Text className="text-text-secondary text-sm mt-1">
                  {suggestion.reason}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Sets */}
        <View className="gap-3">
          {currentWorkoutExercise?.sets.map((set, index) => (
            <Card
              key={index}
              className={set.completed ? 'border border-accent-primary/50' : ''}
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-bg-tertiary items-center justify-center">
                  <Text className="text-white font-bold">{index + 1}</Text>
                </View>

                <View className="flex-1 flex-row gap-2">
                  <View className="flex-1">
                    <Text className="text-text-muted text-xs mb-1">Peso (kg)</Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={set.weight > 0 ? set.weight.toString() : ''}
                      onChangeText={(v) =>
                        handleUpdateSetValue(index, 'weight', v)
                      }
                      placeholder="0"
                      className="text-center"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-muted text-xs mb-1">Reps</Text>
                    <Input
                      keyboardType="number-pad"
                      value={set.reps > 0 ? set.reps.toString() : ''}
                      onChangeText={(v) => handleUpdateSetValue(index, 'reps', v)}
                      placeholder={currentRoutineExercise?.reps?.toString() ?? '0'}
                      className="text-center"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-muted text-xs mb-1">RPE</Text>
                    <Input
                      keyboardType="number-pad"
                      value={set.rpe ? set.rpe.toString() : ''}
                      onChangeText={(v) => handleUpdateSetValue(index, 'rpe', v)}
                      placeholder="7"
                      className="text-center"
                    />
                  </View>
                </View>

                <Pressable
                  onPress={() => handleCompleteSet(index)}
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    set.completed ? 'bg-accent-primary' : 'bg-bg-tertiary'
                  }`}
                >
                  <Check
                    color={set.completed ? colors.bg.primary : colors.text.muted}
                    size={24}
                  />
                </Pressable>
              </View>
            </Card>
          ))}
        </View>

        <Button
          variant="ghost"
          onPress={() => addSet(currentExerciseIndex)}
          className="mt-3"
        >
          + Añadir serie
        </Button>

        <View className="h-32" />
      </ScrollView>

      {/* Navigation */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-bg-primary border-t border-bg-tertiary flex-row gap-4">
        <Button
          variant="secondary"
          onPress={previousExercise}
          disabled={currentExerciseIndex === 0}
          className="flex-1"
          icon={<ChevronLeft color={colors.text.primary} size={24} />}
        >
          Anterior
        </Button>
        {currentExerciseIndex === routine.exercises.length - 1 ? (
          <Button onPress={handleFinishWorkout} className="flex-1">
            Finalizar
          </Button>
        ) : (
          <Button
            onPress={nextExercise}
            className="flex-1"
            icon={<ChevronRight color={colors.bg.primary} size={24} />}
          >
            Siguiente
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}
