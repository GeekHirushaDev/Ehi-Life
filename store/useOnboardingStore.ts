import { create } from "zustand";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";
import { deleteItem, getItem, setItem } from "../utils/storage";

interface OnboardingState {
  language: string;
  primaryGoals: string[];
  eventFocus: string[];
  experienceLevel: string;
  readingPreferences: { theme: "system" | "light" | "dark"; fontSize: number };
  reminders: string[];
  onboardingCompleted: boolean;
  setField: <K extends keyof Omit<OnboardingState, "setField">>(
    key: K,
    value: OnboardingState[K],
  ) => void;
  resetOnboarding: () => void;
}

const initialState = {
  language: "en",
  primaryGoals: [] as string[],
  eventFocus: [] as string[],
  experienceLevel: "",
  readingPreferences: { theme: "system" as const, fontSize: 16 },
  reminders: [] as string[],
  onboardingCompleted: false,
};

const onboardingStorage: StateStorage = {
  getItem: async (name) => {
    const value = await getItem(name);
    return value ?? null;
  },
  setItem: async (name, value) => {
    await setItem(name, value);
  },
  removeItem: async (name) => {
    await deleteItem(name);
  },
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setField: (key, value) => set((state) => ({ ...state, [key]: value })),
      resetOnboarding: () => set({ ...initialState }),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => onboardingStorage),
    },
  ),
);
