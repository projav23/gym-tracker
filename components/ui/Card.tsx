import { View, Pressable } from 'react-native';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, className = '' }: CardProps) {
  const baseStyle = `bg-bg-secondary rounded-2xl p-4 ${className}`;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${baseStyle} active:opacity-80`}
      >
        {children}
      </Pressable>
    );
  }

  return <View className={baseStyle}>{children}</View>;
}
