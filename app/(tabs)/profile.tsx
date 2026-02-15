import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { User, Scale, Ruler, Target, Plus } from 'lucide-react-native';
import { Card, Button, Input } from '@/components/ui';
import { useUserStore } from '@/stores/userStore';
import { colors } from '@/constants/Colors';
import { Goal } from '@/types';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useRoutineStore } from '@/stores/routineStore';

const goalLabels: Record<Goal, string> = {
  strength: 'Fuerza',
  hypertrophy: 'Hipertrofia',
  endurance: 'Resistencia',
};

export default function ProfileScreen() {
  const { user, createUser, updateUser, addWeightEntry, resetProfile } = useUserStore();
  const { resetWorkout } = useWorkoutStore();
  const { resetRoutines } = useRoutineStore();

  const [showWeightInput, setShowWeightInput] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState<Goal>('hypertrophy');

  const handleCreateUser = () => {
    if (!name || !weight || !height) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    createUser(name, parseFloat(weight), parseFloat(height), goal);
  };

  const handleAddWeight = () => {
    const weightNum = parseFloat(newWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('Error', 'Introduce un peso válido');
      return;
    }
    addWeightEntry(weightNum);
    setNewWeight('');
    setShowWeightInput(false);
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
        <ScrollView className="flex-1 px-4">
          <View className="py-8">
            <Text className="text-3xl font-bold text-white text-center">
              Configura tu perfil
            </Text>
            <Text className="text-text-secondary text-center mt-2">
              Necesitamos algunos datos para personalizar tu experiencia
            </Text>
          </View>

          <View className="gap-4">
            <Input
              label="Nombre"
              placeholder="Tu nombre"
              value={name}
              onChangeText={setName}
            />
            <Input
              label="Peso"
              placeholder="70"
              suffix="kg"
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
            />
            <Input
              label="Altura"
              placeholder="175"
              suffix="cm"
              keyboardType="decimal-pad"
              value={height}
              onChangeText={setHeight}
            />

            <View>
              <Text className="text-text-secondary text-sm mb-2">Objetivo</Text>
              <View className="flex-row gap-2">
                {(['strength', 'hypertrophy', 'endurance'] as Goal[]).map((g) => (
                  <Button
                    key={g}
                    variant={goal === g ? 'primary' : 'secondary'}
                    onPress={() => setGoal(g)}
                  >
                    {goalLabels[g]}
                  </Button>
                ))}
              </View>
            </View>

            <View className="mt-4">
              <Button onPress={handleCreateUser} fullWidth>
                Comenzar
              </Button>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const bmi = user.weight / Math.pow(user.height / 100, 2);
  const lastWeights = user.weightHistory.slice(-7);

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold text-white">Perfil</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* User Info Card */}
        <Card className="mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-accent-primary/20 items-center justify-center">
              <User color={colors.accent.primary} size={32} />
            </View>
            <View className="ml-4">
              <Text className="text-white text-xl font-bold">{user.name}</Text>
              <Text className="text-text-secondary">
                Objetivo: {goalLabels[user.goal]}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1 bg-bg-tertiary rounded-xl p-3">
              <View className="flex-row items-center">
                <Scale color={colors.accent.primary} size={18} />
                <Text className="text-text-muted ml-2 text-sm">Peso</Text>
              </View>
              <Text className="text-white text-xl font-bold mt-1">
                {user.weight} kg
              </Text>
            </View>
            <View className="flex-1 bg-bg-tertiary rounded-xl p-3">
              <View className="flex-row items-center">
                <Ruler color={colors.accent.tertiary} size={18} />
                <Text className="text-text-muted ml-2 text-sm">Altura</Text>
              </View>
              <Text className="text-white text-xl font-bold mt-1">
                {user.height} cm
              </Text>
            </View>
            <View className="flex-1 bg-bg-tertiary rounded-xl p-3">
              <View className="flex-row items-center">
                <Target color={colors.accent.secondary} size={18} />
                <Text className="text-text-muted ml-2 text-sm">IMC</Text>
              </View>
              <Text className="text-white text-xl font-bold mt-1">
                {bmi.toFixed(1)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Weight History */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-white">
              Historial de peso
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setShowWeightInput(true)}
              icon={<Plus color={colors.accent.primary} size={18} />}
            >
              Añadir
            </Button>
          </View>

          {showWeightInput && (
            <Card className="mb-3">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    placeholder="Nuevo peso"
                    suffix="kg"
                    keyboardType="decimal-pad"
                    value={newWeight}
                    onChangeText={setNewWeight}
                  />
                </View>
                <Button onPress={handleAddWeight}>Guardar</Button>
                <Button
                  variant="ghost"
                  onPress={() => setShowWeightInput(false)}
                >
                  Cancelar
                </Button>
              </View>
            </Card>
          )}

          <Card>
            {lastWeights.length === 0 ? (
              <Text className="text-text-muted text-center py-4">
                Sin registros de peso
              </Text>
            ) : (
              <View className="gap-2">
                {lastWeights.reverse().map((entry, index) => (
                  <View
                    key={entry.date}
                    className="flex-row justify-between items-center py-2 border-b border-bg-tertiary"
                    style={{
                      borderBottomWidth: index === lastWeights.length - 1 ? 0 : 1,
                    }}
                  >
                    <Text className="text-text-secondary">
                      {new Date(entry.date).toLocaleDateString('es-ES')}
                    </Text>
                    <Text className="text-white font-semibold">
                      {entry.weight} kg
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>

        {/* Edit Goal */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-white mb-3">
            Cambiar objetivo
          </Text>
          <View className="flex-row gap-2">
            {(['strength', 'hypertrophy', 'endurance'] as Goal[]).map((g) => (
              <Button
                key={g}
                variant={user.goal === g ? 'primary' : 'secondary'}
                onPress={() => updateUser({ goal: g })}
              >
                {goalLabels[g]}
              </Button>
            ))}
          </View>
        </View>

        <View className="flex-col items-center justify-center gap-4">
          <Button 
          onPress={() => {
            resetWorkout()
            resetRoutines()
          }}
          variant='danger'>Borrar datos</Button>
          <Button onPress={() => resetWorkout()} variant='danger'>Borrar workouts</Button>
          <Button onPress={() => resetRoutines()} variant='danger'>Borrar rutinas</Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
