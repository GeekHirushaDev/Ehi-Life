export type AppColorScheme = "light" | "dark";

export type ThemeColors = {
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  inputBackground: string;
  border: string;
  googleButtonBG: string;
  googleButtonText: string;
};

const mindfulGreen = "#4F7B5A";
const softSaffron = "#E5A13B";

export const AppColors: Record<AppColorScheme, ThemeColors> = {
  light: {
    text: "#2D4A3E",
    background: "#FFFFFF",
    tint: mindfulGreen,
    icon: mindfulGreen,
    tabIconDefault: "#9AA39D",
    tabIconSelected: mindfulGreen,
    inputBackground: "#FFFCF7",
    border: "#E8E2D6",
    googleButtonBG: "#FFFFFF",
    googleButtonText: "#2D4A3E",
  },
  dark: {
    text: "#F5F1E9",
    background: "#111612",
    tint: softSaffron,
    icon: softSaffron,
    tabIconDefault: "#8A948D",
    tabIconSelected: softSaffron,
    inputBackground: "#182019",
    border: "#2A342D",
    googleButtonBG: "#182019",
    googleButtonText: "#F5F1E9",
  },
};
