import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  suffix?: string;
}

export function Input({ label, error, suffix, className = '', ...props }: InputProps) {
  return (
    <View className="w-full">
      {label && (
        <Text className="text-text-secondary text-sm mb-2">{label}</Text>
      )}
      <View className="relative">
        <TextInput
          placeholderTextColor="#666666"
          className={`
            bg-bg-tertiary text-white px-4 py-3 rounded-xl
            ${error ? 'border border-red-500' : ''}
            ${suffix ? 'pr-12' : ''}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <View className="absolute right-4 top-0 bottom-0 justify-center">
            <Text className="text-text-muted">{suffix}</Text>
          </View>
        )}
      </View>
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}
