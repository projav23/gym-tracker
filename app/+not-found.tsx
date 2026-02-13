import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-bg-primary p-5">
        <Text className="text-xl font-bold text-white">
          Esta pantalla no existe.
        </Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="text-accent-primary">Ir al inicio</Text>
        </Link>
      </View>
    </>
  );
}
