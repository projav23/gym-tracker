import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Plus, ChevronRight, Dumbbell, Trash2 } from 'lucide-react-native';
import { Card, Button } from '@/components/ui';
import { useRoutineStore } from '@/stores/routineStore';
import { colors } from '@/constants/Colors';

export default function RoutinesScreen() {
  const { routines, deleteRoutine } = useRoutineStore();

  const handleDelete = (id: string) => {
    deleteRoutine(id);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <View className="px-4 py-4 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-white">Mis Rutinas</Text>
        <Pressable
          onPress={() => router.push('/routine/create')}
          className="bg-accent-primary w-10 h-10 rounded-full items-center justify-center"
        >
          <Plus color={colors.bg.primary} size={24} />
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-4">
        {routines.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Dumbbell color={colors.text.muted} size={64} />
            <Text className="text-text-secondary text-lg mt-4 text-center">
              No tienes rutinas todavía
            </Text>
            <Text className="text-text-muted text-center mt-2 mb-6">
              Crea tu primera rutina para empezar a entrenar
            </Text>
            <Button
              onPress={() => router.push('/routine/create')}
              icon={<Plus color={colors.bg.primary} size={20} />}
            >
              Crear Rutina
            </Button>
          </View>
        ) : (
          <View className="gap-3 pb-20">
            {routines.map((routine) => (
              <Link key={routine.id} href={`/routine/${routine.id}`} asChild>
                <Card className="flex-row items-center">
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-lg">
                      {routine.name}
                    </Text>
                    {routine.description && (
                      <Text className="text-text-secondary text-sm mt-1">
                        {routine.description}
                      </Text>
                    )}
                    <Text className="text-text-muted text-sm mt-2">
                      {routine.exercises.length} ejercicios
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(routine.id);
                      }}
                      className="p-2"
                    >
                      <Trash2 color={colors.error} size={20} />
                    </Pressable>
                    <ChevronRight color={colors.text.muted} size={24} />
                  </View>
                </Card>
              </Link>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
