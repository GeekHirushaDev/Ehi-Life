import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeConfig } from "../../context/ThemeConfig";
import { useOnboardingStore } from "../../store/useOnboardingStore";

export default function Step1Language() {
  const { t, i18n } = useTranslation();
  const { colors } = useThemeConfig();
  const { language, setField } = useOnboardingStore();

  const handleSelect = (lang: string) => {
    setField("language", lang);
    i18n.changeLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t("w_title_step1")}
      </Text>
      <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
        {t("w_sub_step1")}
      </Text>

      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.inputBackground,
            borderColor: language === "en" ? colors.tint : colors.border,
          },
        ]}
        onPress={() => handleSelect("en")}
        activeOpacity={0.7}
      >
        <Text style={[styles.cardText, { color: colors.text }]}>English</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.inputBackground,
            borderColor: language === "si" ? colors.tint : colors.border,
          },
        ]}
        onPress={() => handleSelect("si")}
        activeOpacity={0.7}
      >
        <Text style={[styles.cardText, { color: colors.text }]}>
          සිංහල {`(Sinhala)`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: { fontSize: 18, textAlign: "center", marginBottom: 48 },
  card: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
    alignItems: "center",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
    elevation: 2,
  },
  cardText: { fontSize: 20, fontWeight: "600" },
});
