import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-accent-primary',
    text: 'text-bg-primary font-semibold',
  },
  secondary: {
    container: 'bg-bg-tertiary',
    text: 'text-white',
  },
  outline: {
    container: 'border border-accent-primary bg-transparent',
    text: 'text-accent-primary',
  },
  ghost: {
    container: 'bg-transparent',
    text: 'text-accent-primary',
  },
  danger: {
    container: 'bg-red-500',
    text: 'text-white font-semibold',
  },
};

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: {
    container: 'px-3 py-2 rounded-lg',
    text: 'text-sm',
  },
  md: {
    container: 'px-4 py-3 rounded-xl',
    text: 'text-base',
  },
  lg: {
    container: 'px-6 py-4 rounded-xl',
    text: 'text-lg',
  },
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  className = '',
}: ButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        flex-row items-center justify-center
        ${variantStyle.container}
        ${sizeStyle.container}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50' : 'active:opacity-80'}
        ${className}
      `}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#0A0A0A' : '#00D4AA'}
          size="small"
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`${variantStyle.text} ${sizeStyle.text}`}>
            {children}
          </Text>
        </>
      )}
    </Pressable>
  );
}
