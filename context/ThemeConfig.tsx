import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { AppColors, AppColorScheme, ThemeColors } from "../constants/AppColors";
import { getItem, setItem } from "../utils/storage";

const THEME_MODE_KEY = "app_theme_mode";

export type ThemeMode = "system" | "light" | "dark";

type ThemeConfigContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  activeScheme: AppColorScheme;
  colors: ThemeColors;
};

const ThemeConfigContext = createContext<ThemeConfigContextValue | undefined>(
  undefined,
);

export function ThemeConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await getItem(THEME_MODE_KEY);
        if (
          savedMode === "light" ||
          savedMode === "dark" ||
          savedMode === "system"
        ) {
          setThemeModeState(savedMode);
        }
      } catch (error) {
        console.error("Failed to load theme mode:", error);
      }
    };

    loadThemeMode();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await setItem(THEME_MODE_KEY, mode);
    } catch (error) {
      console.error("Failed to save theme mode:", error);
    }
  };

  const activeScheme: AppColorScheme =
    themeMode === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : themeMode;

  const toggleDarkMode = async () => {
    const nextMode: ThemeMode = activeScheme === "dark" ? "light" : "dark";
    await setThemeMode(nextMode);
  };

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      toggleDarkMode,
      activeScheme,
      colors: AppColors[activeScheme],
    }),
    [themeMode, activeScheme],
  );

  return (
    <ThemeConfigContext.Provider value={value}>
      {children}
    </ThemeConfigContext.Provider>
  );
}

export function useThemeConfig() {
  const context = useContext(ThemeConfigContext);
  if (!context) {
    throw new Error("useThemeConfig must be used within ThemeConfigProvider");
  }
  return context;
}
