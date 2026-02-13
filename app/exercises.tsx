import { View, Text, ScrollView, Pressable, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import { ArrowLeft, Plus, Search, X, Pencil, Trash2 } from 'lucide-react-native';
import { Card, Button, Input } from '@/components/ui';
import { useRoutineStore } from '@/stores/routineStore';
import { colors } from '@/constants/Colors';
import { muscleGroupLabels, equipmentLabels } from '@/constants/exercises';
import { Exercise, MuscleGroup, Equipment } from '@/types';

const muscleGroups: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'quadriceps', 'hamstrings', 'glutes', 'calves', 'abs', 'obliques',
];

const equipmentOptions: Equipment[] = [
  'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'kettlebell', 'bands', 'other',
];

interface ExerciseForm {
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
}

export default function ExercisesScreen() {
  const { exercises, addCustomExercise, updateExercise, deleteExercise } = useRoutineStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [form, setForm] = useState<ExerciseForm>({
    name: '',
    muscleGroup: 'chest',
    equipment: 'barbell',
  });

  const filteredExercises = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      muscleGroupLabels[e.muscleGroup]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = filteredExercises.reduce<Record<string, Exercise[]>>((acc, e) => {
    const group = muscleGroupLabels[e.muscleGroup] || e.muscleGroup;
    if (!acc[group]) acc[group] = [];
    acc[group].push(e);
    return acc;
  }, {});

  const openCreateForm = () => {
    setEditingExercise(null);
    setForm({ name: '', muscleGroup: 'chest', equipment: 'barbell' });
    setShowForm(true);
  };

  const openEditForm = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setForm({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;

    if (editingExercise) {
      updateExercise(editingExercise.id, form);
    } else {
      addCustomExercise(form);
    }
    setShowForm(false);
    setEditingExercise(null);
  };

  const handleDelete = (exercise: Exercise) => {
    Alert.alert(
      'Eliminar ejercicio',
      `¿Seguro que quieres eliminar "${exercise.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const deleted = deleteExercise(exercise.id);
            if (!deleted) {
              Alert.alert(
                'No se puede eliminar',
                'Este ejercicio está siendo usado en una rutina.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="px-4 py-4 flex-row items-center gap-4">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft color={colors.text.primary} size={24} />
        </Pressable>
        <Text className="text-xl font-bold text-white flex-1">Ejercicios</Text>
        <Pressable
          onPress={openCreateForm}
          className="bg-accent-primary w-10 h-10 rounded-full items-center justify-center"
        >
          <Plus color={colors.bg.primary} size={24} />
        </Pressable>
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
        {Object.entries(grouped).map(([group, groupExercises]) => (
          <View key={group} className="mb-4">
            <Text className="text-text-secondary text-sm font-semibold mb-2 uppercase">
              {group}
            </Text>
            {groupExercises.map((exercise) => (
              <View
                key={exercise.id}
                className="flex-row items-center py-3 border-b border-bg-tertiary"
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-white">{exercise.name}</Text>
                    {exercise.isCustom && (
                      <View className="bg-accent-tertiary/20 px-2 py-0.5 rounded">
                        <Text className="text-accent-tertiary text-xs">Custom</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-text-muted text-xs mt-1">
                    {equipmentLabels[exercise.equipment]}
                  </Text>
                </View>
                {exercise.isCustom && (
                  <View className="flex-row items-center gap-2">
                    <Pressable onPress={() => openEditForm(exercise)} className="p-2">
                      <Pencil color={colors.text.secondary} size={18} />
                    </Pressable>
                    <Pressable onPress={() => handleDelete(exercise)} className="p-2">
                      <Trash2 color={colors.error} size={18} />
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
        <View className="h-20" />
      </ScrollView>

      <Modal visible={showForm} animationType="slide" transparent>
        <View className="flex-1 justify-end">
          <View className="bg-bg-secondary rounded-t-3xl px-4 pt-6 pb-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-white">
                {editingExercise ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
              </Text>
              <Pressable onPress={() => setShowForm(false)}>
                <X color={colors.text.secondary} size={24} />
              </Pressable>
            </View>

            <View className="gap-4">
              <Input
                label="Nombre"
                placeholder="Ej: Press con Mancuernas"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />

              <View>
                <Text className="text-text-secondary text-sm mb-2">Grupo muscular</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {muscleGroups.map((mg) => (
                      <Pressable
                        key={mg}
                        onPress={() => setForm({ ...form, muscleGroup: mg })}
                        className={`px-3 py-2 rounded-lg ${
                          form.muscleGroup === mg ? 'bg-accent-primary' : 'bg-bg-tertiary'
                        }`}
                      >
                        <Text
                          className={
                            form.muscleGroup === mg
                              ? 'text-bg-primary font-semibold'
                              : 'text-white'
                          }
                        >
                          {muscleGroupLabels[mg]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View>
                <Text className="text-text-secondary text-sm mb-2">Equipamiento</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {equipmentOptions.map((eq) => (
                      <Pressable
                        key={eq}
                        onPress={() => setForm({ ...form, equipment: eq })}
                        className={`px-3 py-2 rounded-lg ${
                          form.equipment === eq ? 'bg-accent-primary' : 'bg-bg-tertiary'
                        }`}
                      >
                        <Text
                          className={
                            form.equipment === eq
                              ? 'text-bg-primary font-semibold'
                              : 'text-white'
                          }
                        >
                          {equipmentLabels[eq]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <Button onPress={handleSave} disabled={!form.name.trim()} fullWidth>
                {editingExercise ? 'Guardar Cambios' : 'Crear Ejercicio'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
