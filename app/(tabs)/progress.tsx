import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, TrendingUp, Calendar } from 'lucide-react-native';
import { Card } from '@/components/ui';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useRoutineStore } from '@/stores/routineStore';
import { calculate1RM } from '@/services/progressionEngine';
import { colors } from '@/constants/Colors';

export default function ProgressScreen() {
  const { workouts, getPersonalRecord } = useWorkoutStore();
  const { exercises } = useRoutineStore();

  const exercisesWithPRs = exercises
    .map((exercise) => {
      const pr = getPersonalRecord(exercise.id);
      if (!pr) return null;
      const estimated1RM = calculate1RM(pr.weight, pr.reps);
      return {
        ...exercise,
        pr,
        estimated1RM,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b?.estimated1RM ?? 0) - (a?.estimated1RM ?? 0))
    .slice(0, 10);

  const totalWorkouts = workouts.length;
  const totalVolume = workouts.reduce((acc, w) => {
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

  const workoutsByMonth = workouts.reduce<Record<string, number>>((acc, w) => {
    const month = new Date(w.date).toLocaleDateString('es-ES', {
      month: 'short',
      year: '2-digit',
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold text-white">Progreso</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Stats Overview */}
        <View className="flex-row gap-3 mb-6">
          <Card className="flex-1">
            <Calendar color={colors.accent.primary} size={24} />
            <Text className="text-2xl font-bold text-white mt-2">
              {totalWorkouts}
            </Text>
            <Text className="text-text-muted text-sm">Entrenamientos</Text>
          </Card>
          <Card className="flex-1">
            <TrendingUp color={colors.accent.tertiary} size={24} />
            <Text className="text-2xl font-bold text-white mt-2">
              {totalVolume > 1000
                ? `${(totalVolume / 1000).toFixed(0)}k`
                : totalVolume}
            </Text>
            <Text className="text-text-muted text-sm">kg totales</Text>
          </Card>
        </View>

        {/* Personal Records */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Trophy color={colors.accent.secondary} size={24} />
            <Text className="text-lg font-semibold text-white ml-2">
              Records Personales
            </Text>
          </View>

          {exercisesWithPRs.length === 0 ? (
            <Card>
              <Text className="text-text-secondary text-center py-4">
                Completa entrenamientos para ver tus récords personales
              </Text>
            </Card>
          ) : (
            <View className="gap-2">
              {exercisesWithPRs.map((item) => (
                <Card key={item!.id} className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-white font-medium">{item!.name}</Text>
                    <Text className="text-text-muted text-sm">
                      {new Date(item!.pr.date).toLocaleDateString('es-ES')}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-accent-primary font-bold text-lg">
                      {item!.pr.weight} kg × {item!.pr.reps}
                    </Text>
                    <Text className="text-text-muted text-sm">
                      1RM: {item!.estimated1RM} kg
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Monthly Activity */}
        {Object.keys(workoutsByMonth).length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-white mb-3">
              Actividad Mensual
            </Text>
            <Card>
              <View className="flex-row flex-wrap gap-2">
                {Object.entries(workoutsByMonth)
                  .slice(-6)
                  .map(([month, count]) => (
                    <View
                      key={month}
                      className="bg-bg-tertiary px-3 py-2 rounded-lg items-center"
                    >
                      <Text className="text-white font-bold">{count}</Text>
                      <Text className="text-text-muted text-xs">{month}</Text>
                    </View>
                  ))}
              </View>
            </Card>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
