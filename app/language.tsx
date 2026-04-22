import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeConfig } from "../context/ThemeConfig";
import { LANGUAGE_KEY } from "../i18n";
import { setItem } from "../utils/storage";

export default function LanguageSelection() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const {
    colors: currentColors,
    toggleDarkMode,
    activeScheme,
  } = useThemeConfig();

  const selectLanguage = async (lng: string) => {
    await setItem(LANGUAGE_KEY, lng);
    await i18n.changeLanguage(lng);
    router.replace("/sign-in");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <TouchableOpacity style={styles.themeToggle} onPress={toggleDarkMode}>
        <Ionicons
          name={activeScheme === "dark" ? "sunny" : "moon"}
          size={28}
          color={currentColors.icon}
        />
      </TouchableOpacity>
      <View style={styles.innerContainer}>
        <Text style={[styles.title, { color: currentColors.text }]}>
          Choose Your Language
        </Text>
        <Text style={[styles.subtitle, { color: currentColors.tint }]}>
          භාෂාව තෝරන්න
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: currentColors.inputBackground,
              borderColor: currentColors.border,
            },
          ]}
          onPress={() => selectLanguage("en")}
        >
          <Text style={[styles.buttonText, { color: currentColors.text }]}>
            English
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: currentColors.inputBackground,
              borderColor: currentColors.border,
            },
          ]}
          onPress={() => selectLanguage("si")}
        >
          <Text style={[styles.buttonText, { color: currentColors.text }]}>
            සිංහල {`(Sinhala)`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  themeToggle: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  innerContainer: { flex: 1, justifyContent: "center", padding: 24 },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: { fontSize: 18, textAlign: "center", marginBottom: 48 },
  button: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: "center",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    elevation: 2,
  },
  buttonText: { fontSize: 20, fontWeight: "600" },
});
