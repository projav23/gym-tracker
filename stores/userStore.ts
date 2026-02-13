import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as Crypto from 'expo-crypto';
import { User, Goal, WeightEntry } from '@/types';
import { zustandStorage } from '@/services/storage';

interface UserState {
  user: User | null;
  isOnboarded: boolean;
  createUser: (name: string, weight: number, height: number, goal: Goal, birthDate?: string) => void;
  updateUser: (updates: Partial<Omit<User, 'id' | 'createdAt'>>) => void;
  addWeightEntry: (weight: number) => void;
  deleteWeightEntry: (date: string) => void;
  setOnboarded: (value: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isOnboarded: false,

      createUser: (name, weight, height, goal, birthDate) => {
        const now = new Date().toISOString();
        const user: User = {
          id: Crypto.randomUUID(),
          name,
          weight,
          height,
          goal,
          birthDate,
          createdAt: now,
          weightHistory: [{ date: now, weight }],
        };
        set({ user, isOnboarded: true });
      },

      updateUser: (updates) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, ...updates } });
      },

      addWeightEntry: (weight) => {
        const { user } = get();
        if (!user) return;
        const entry: WeightEntry = {
          date: new Date().toISOString(),
          weight,
        };
        set({
          user: {
            ...user,
            weight,
            weightHistory: [...user.weightHistory, entry],
          },
        });
      },

      deleteWeightEntry: (date) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            weightHistory: user.weightHistory.filter((e) => e.date !== date),
          },
        });
      },

      setOnboarded: (value) => set({ isOnboarded: value }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
