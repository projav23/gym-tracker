export const colors = {
  bg: {
    primary: '#0A0A0A',
    secondary: '#141414',
    tertiary: '#1E1E1E',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    muted: '#666666',
  },
  accent: {
    primary: '#00D4AA',
    secondary: '#FF6B35',
    tertiary: '#6366F1',
  },
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

export default {
  dark: {
    text: colors.text.primary,
    background: colors.bg.primary,
    tint: colors.accent.primary,
    tabIconDefault: colors.text.muted,
    tabIconSelected: colors.accent.primary,
    card: colors.bg.secondary,
    border: colors.bg.tertiary,
  },
};
