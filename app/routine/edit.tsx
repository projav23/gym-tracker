import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Plus, Search, X, GripVertical } from 'lucide-react-native';
import { Card, Button, Input } from '@/components/ui';
import { useRoutineStore } from '@/stores/routineStore';
import { colors } from '@/constants/Colors';
import { muscleGroupLabels } from '@/constants/exercises';
import { Exercise } from '@/types';

export default function EditRoutineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    routines,
    exercises,
    getExerciseById,
    updateRoutine,
    addExerciseToRoutine,
    removeExerciseFromRoutine,
    updateRoutineExercise,
    reorderExercises,
  } = useRoutineStore();

  const routine = routines.find((r) => r.id === id);

  const [name, setName] = useState(routine?.name ?? '');
  const [description, setDescription] = useState(routine?.description ?? '');
  const [localExercises, setLocalExercises] = useState(
    () =>
      routine?.exercises.map((re) => ({
        routineExerciseId: re.id,
        exercise: getExerciseById(re.exerciseId)!,
        sets: re.sets,
        reps: re.reps,
        restSeconds: re.restSeconds,
      })) ?? []
  );
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredExercises = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      muscleGroupLabels[e.muscleGroup]
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const handleAddExercise = (exercise: Exercise) => {
    setLocalExercises([
      ...localExercises,
      { routineExerciseId: null as unknown as string, exercise, sets: 3, reps: 10, restSeconds: 90 },
    ]);
    setShowExercisePicker(false);
    setSearchQuery('');
  };

  const handleRemoveExercise = (index: number) => {
    setLocalExercises(localExercises.filter((_, i) => i !== index));
  };

  const handleUpdateExercise = (
    index: number,
    field: 'sets' | 'reps' | 'restSeconds',
    value: number
  ) => {
    setLocalExercises(
      localExercises.map((e, i) =>
        i === index ? { ...e, [field]: value } : e
      )
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;

    updateRoutine(routine.id, {
      name,
      description: description || undefined,
    });

    // Remove exercises that were deleted
    const currentIds = new Set(
      localExercises
        .filter((e) => e.routineExerciseId)
        .map((e) => e.routineExerciseId)
    );
    for (const existing of routine.exercises) {
      if (!currentIds.has(existing.id)) {
        removeExerciseFromRoutine(routine.id, existing.id);
      }
    }

    // Update existing and add new exercises
    for (const item of localExercises) {
      if (item.routineExerciseId && routine.exercises.some((e) => e.id === item.routineExerciseId)) {
        updateRoutineExercise(routine.id, item.routineExerciseId, {
          sets: item.sets,
          reps: item.reps,
          restSeconds: item.restSeconds,
        });
      } else {
        addExerciseToRoutine(routine.id, {
          exerciseId: item.exercise.id,
          sets: item.sets,
          reps: item.reps,
          restSeconds: item.restSeconds,
        });
      }
    }

    router.back();
  };

  if (showExercisePicker) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary">
        <View className="px-4 py-4 flex-row items-center gap-4">
          <Pressable onPress={() => setShowExercisePicker(false)}>
            <ArrowLeft color={colors.text.primary} size={24} />
          </Pressable>
          <Text className="text-xl font-bold text-white">Añadir ejercicio</Text>
        </View>

        <View className="px-4 mb-4">
          <View className="flex-row items-center bg-bg-tertiary rounded-xl px-4">
            <Search color={colors.text.muted} size={20} />
            <TextInput
              className="flex-1 text-white py-3 px-3"
              placeholder="Buscar ejercicio..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <Pressable onPress={() => setSearchQuery('')}>
                <X color={colors.text.muted} size={20} />
              </Pressable>
            )}
          </View>
        </View>

        <ScrollView className="flex-1 px-4">
          {Object.entries(
            filteredExercises.reduce<Record<string, Exercise[]>>((acc, e) => {
              const group = muscleGroupLabels[e.muscleGroup] || e.muscleGroup;
              if (!acc[group]) acc[group] = [];
              acc[group].push(e);
              return acc;
            }, {})
          ).map(([group, groupExercises]) => (
            <View key={group} className="mb-4">
              <Text className="text-text-secondary text-sm font-semibold mb-2 uppercase">
                {group}
              </Text>
              {groupExercises.map((exercise) => {
                const isSelected = localExercises.some(
                  (e) => e.exercise.id === exercise.id
                );
                return (
                  <Pressable
                    key={exercise.id}
                    onPress={() => !isSelected && handleAddExercise(exercise)}
                    className={`py-3 border-b border-bg-tertiary ${
                      isSelected ? 'opacity-50' : ''
                    }`}
                  >
                    <Text className="text-white">{exercise.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="px-4 py-4 flex-row items-center gap-4">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </Pressable>
        <Text className="text-xl font-bold text-white flex-1">Editar Rutina</Text>
        <Button
          onPress={handleSave}
          disabled={!name.trim() || localExercises.length === 0}
        >
          Guardar
        </Button>
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="gap-4 mb-6">
          <Input
            label="Nombre de la rutina"
            placeholder="Ej: Push Day"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Descripción (opcional)"
            placeholder="Ej: Pecho, hombros y tríceps"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-white">Ejercicios</Text>
          <Button
            variant="outline"
            size="sm"
            onPress={() => setShowExercisePicker(true)}
            icon={<Plus color={colors.accent.primary} size={18} />}
          >
            Añadir
          </Button>
        </View>

        {localExercises.length === 0 ? (
          <Card>
            <Text className="text-text-secondary text-center py-4">
              Añade ejercicios a tu rutina
            </Text>
          </Card>
        ) : (
          <View className="gap-3">
            {localExercises.map((item, index) => (
              <Card key={`${item.exercise.id}-${index}`}>
                <View className="flex-row items-center mb-3">
                  <GripVertical color={colors.text.muted} size={20} />
                  <Text className="text-white font-semibold flex-1 ml-2">
                    {item.exercise.name}
                  </Text>
                  <Pressable onPress={() => handleRemoveExercise(index)}>
                    <X color={colors.error} size={20} />
                  </Pressable>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-text-muted text-xs mb-1">Series</Text>
                    <View className="flex-row items-center bg-bg-tertiary rounded-lg">
                      <Pressable
                        onPress={() =>
                          handleUpdateExercise(
                            index,
                            'sets',
                            Math.max(1, item.sets - 1)
                          )
                        }
                        className="px-3 py-2"
                      >
                        <Text className="text-white text-lg">-</Text>
                      </Pressable>
                      <Text className="text-white flex-1 text-center font-bold">
                        {item.sets}
                      </Text>
                      <Pressable
                        onPress={() =>
                          handleUpdateExercise(index, 'sets', item.sets + 1)
                        }
                        className="px-3 py-2"
                      >
                        <Text className="text-white text-lg">+</Text>
                      </Pressable>
                    </View>
                  </View>

                  <View className="flex-1">
                    <Text className="text-text-muted text-xs mb-1">Reps</Text>
                    <View className="flex-row items-center bg-bg-tertiary rounded-lg">
                      <Pressable
                        onPress={() =>
                          handleUpdateExercise(
                            index,
                            'reps',
                            Math.max(1, item.reps - 1)
                          )
                        }
                        className="px-3 py-2"
                      >
                        <Text className="text-white text-lg">-</Text>
                      </Pressable>
                      <Text className="text-white flex-1 text-center font-bold">
                        {item.reps}
                      </Text>
                      <Pressable
                        onPress={() =>
                          handleUpdateExercise(index, 'reps', item.reps + 1)
                        }
                        className="px-3 py-2"
                      >
                        <Text className="text-white text-lg">+</Text>
                      </Pressable>
                    </View>
                  </View>

                  <View className="flex-1">
                    <Text className="text-text-muted text-xs mb-1">
                      Descanso
                    </Text>
                    <View className="flex-row items-center bg-bg-tertiary rounded-lg">
                      <Pressable
                        onPress={() =>
                          handleUpdateExercise(
                            index,
                            'restSeconds',
                            Math.max(30, item.restSeconds - 15)
                          )
                        }
                        className="px-3 py-2"
                      >
                        <Text className="text-white text-lg">-</Text>
                      </Pressable>
                      <Text className="text-white flex-1 text-center font-bold text-sm">
                        {item.restSeconds}s
                      </Text>
                      <Pressable
                        onPress={() =>
                          handleUpdateExercise(
                            index,
                            'restSeconds',
                            item.restSeconds + 15
                          )
                        }
                        className="px-3 py-2"
                      >
                        <Text className="text-white text-lg">+</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
