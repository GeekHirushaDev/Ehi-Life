import React from "react";
import { useTranslation } from "react-i18next";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useThemeConfig } from "../../context/ThemeConfig";
import { useOnboardingStore } from "../../store/useOnboardingStore";

export default function Step5Reading() {
  const { t } = useTranslation();
  const { colors } = useThemeConfig();
  const { readingPreferences, setField } = useOnboardingStore();

  const handleTheme = (theme: "system" | "light" | "dark") => {
    setField("readingPreferences", { ...readingPreferences, theme });
  };

  const handleSize = (fontSize: number) => {
    setField("readingPreferences", { ...readingPreferences, fontSize });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t("w_title_step5")}
      </Text>
      <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
        {t("w_sub_step5")}
      </Text>

      <Text style={[styles.sectionHeader, { color: colors.text }]}>
        {t("w_lbl_theme")}
      </Text>
      <View style={styles.buttonRow}>
        {(["system", "light", "dark"] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.optionBtn,
              {
                backgroundColor:
                  readingPreferences.theme === mode
                    ? colors.tint
                    : colors.inputBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={() => handleTheme(mode)}
          >
            <Text
              style={{
                color:
                  readingPreferences.theme === mode ? "#FFFFFF" : colors.text,
                fontWeight: "600",
              }}
            >
              {t(`w_opt_theme_${mode}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionHeader, { color: colors.text }]}>
        {t("w_lbl_font_size")}
      </Text>
      <View style={styles.buttonRow}>
        {[14, 18, 24].map((size, idx) => {
          let label = "w_opt_size_small";
          if (idx === 1) label = "w_opt_size_medium";
          if (idx === 2) label = "w_opt_size_large";

          return (
            <TouchableOpacity
              key={size}
              style={[
                styles.optionBtn,
                {
                  backgroundColor:
                    readingPreferences.fontSize === size
                      ? colors.tint
                      : colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleSize(size)}
            >
              <Text
                style={{
                  fontSize: size,
                  color:
                    readingPreferences.fontSize === size
                      ? "#FFFFFF"
                      : colors.text,
                  fontWeight: "600",
                }}
              >
                A
              </Text>
              <Text
                style={{
                  color:
                    readingPreferences.fontSize === size
                      ? "#FFFFFF"
                      : colors.text,
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {t(label)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 40 },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 16,
  },
  buttonRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  optionBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: "30%",
  },
});
