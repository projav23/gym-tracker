import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Flame, Calendar, TrendingUp, ChevronRight } from 'lucide-react-native';
import { Card, Button } from '@/components/ui';
import { useUserStore } from '@/stores/userStore';
import { useRoutineStore } from '@/stores/routineStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { getStreak } from '@/services/progressionEngine';
import { colors } from '@/constants/Colors';

export default function HomeScreen() {
  const { user } = useUserStore();
  const { routines } = useRoutineStore();
  const { workouts } = useWorkoutStore();

  const streak = getStreak(workouts.map((w) => w.date));
  const thisWeekWorkouts = workouts.filter((w) => {
    const workoutDate = new Date(w.date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return workoutDate >= weekAgo;
  }).length;

  const totalVolume = workouts
    .filter((w) => {
      const workoutDate = new Date(w.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return workoutDate >= weekAgo;
    })
    .reduce((acc, w) => {
      return (
        acc +
        w.exercises.reduce((eAcc, e) => {
          return (
            eAcc +
            e.sets
              .filter((s) => s.completed)
              .reduce((sAcc, s) => sAcc + s.weight * s.reps, 0)
          );
        }, 0)
      );
    }, 0);

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ScrollView className="flex-1 px-4">
        <View className="py-4">
          <Text className="text-3xl font-bold text-white">
            Hola{user?.name ? `, ${user.name}` : ''}
          </Text>
          <Text className="text-text-secondary mt-1">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="flex-row gap-3 mb-6">
          <Card className="flex-1">
            <View className="flex-row items-center mb-2">
              <Flame color={colors.accent.secondary} size={20} />
              <Text className="text-text-secondary ml-2 text-sm">Racha</Text>
            </View>
            <Text className="text-2xl font-bold text-white">{streak}</Text>
            <Text className="text-text-muted text-xs">días</Text>
          </Card>

          <Card className="flex-1">
            <View className="flex-row items-center mb-2">
              <Calendar color={colors.accent.primary} size={20} />
              <Text className="text-text-secondary ml-2 text-sm">Esta semana</Text>
            </View>
            <Text className="text-2xl font-bold text-white">{thisWeekWorkouts}</Text>
            <Text className="text-text-muted text-xs">entrenamientos</Text>
          </Card>

          <Card className="flex-1">
            <View className="flex-row items-center mb-2">
              <TrendingUp color={colors.accent.tertiary} size={20} />
              <Text className="text-text-secondary ml-2 text-sm">Volumen</Text>
            </View>
            <Text className="text-2xl font-bold text-white">
              {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}
            </Text>
            <Text className="text-text-muted text-xs">kg esta semana</Text>
          </Card>
        </View>

        {/* Quick Start Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-white mb-3">
            Empezar entrenamiento
          </Text>
          {routines.length === 0 ? (
            <Card>
              <Text className="text-text-secondary mb-3">
                Aún no tienes rutinas. Crea tu primera rutina para comenzar.
              </Text>
              <Link href="/(tabs)/routines" asChild>
                <Button variant="primary">Crear Rutina</Button>
              </Link>
            </Card>
          ) : (
            <View className="gap-3">
              {routines.slice(0, 3).map((routine) => (
                <Link
                  key={routine.id}
                  href={`/routine/${routine.id}`}
                  asChild
                >
                  <Card className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-white font-medium">{routine.name}</Text>
                      <Text className="text-text-secondary text-sm">
                        {routine.exercises.length} ejercicios
                      </Text>
                    </View>
                    <ChevronRight color={colors.text.muted} size={20} />
                  </Card>
                </Link>
              ))}
            </View>
          )}
        </View>

        {/* Recent Activity */}
        {workouts.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-white mb-3">
              Actividad reciente
            </Text>
            {workouts.slice(-3).reverse().map((workout) => (
              <Card key={workout.id} className="mb-3">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-white font-medium">
                      {workout.routineName}
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      {new Date(workout.date).toLocaleDateString('es-ES')} •{' '}
                      {workout.duration} min
                    </Text>
                  </View>
                  <View className="bg-accent-primary/20 px-3 py-1 rounded-full">
                    <Text className="text-accent-primary text-sm font-medium">
                      {workout.exercises.reduce(
                        (acc, e) => acc + e.sets.filter((s) => s.completed).length,
                        0
                      )}{' '}
                      sets
                    </Text>
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
