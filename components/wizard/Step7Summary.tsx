import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useThemeConfig } from "../../context/ThemeConfig";
import { useOnboardingStore } from "../../store/useOnboardingStore";

export default function Step7Summary() {
  const { t } = useTranslation();
  const { colors } = useThemeConfig();
  const store = useOnboardingStore();

  const getTranslatedList = (list: string[], prefix: string) => {
    if (list.length === 0 || (list.length === 1 && list[0] === "skip"))
      return t("w_none_selected");
    return list.map((item) => t(`${prefix}_${item}`)).join(", ");
  };

  const getThemeText = () => {
    if (store.readingPreferences.theme === "system")
      return t("w_opt_theme_sys");
    if (store.readingPreferences.theme === "light")
      return t("w_opt_theme_light");
    return t("w_opt_theme_dark");
  };

  const getSizeText = () => {
    if (store.readingPreferences.fontSize <= 14) return t("w_opt_size_small");
    if (store.readingPreferences.fontSize >= 24) return t("w_opt_size_large");
    return t("w_opt_size_medium");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="sparkles" size={56} color={colors.tint} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        {t("w_title_step7")}
      </Text>
      <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
        {t("w_sub_step7")}
      </Text>

      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.label, { color: colors.tabIconDefault }]}>
          {t("w_lbl_lang")}
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {store.language === "en" ? "English" : "සිංහල"}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.label, { color: colors.tabIconDefault }]}>
          {t("w_lbl_goals")}
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {getTranslatedList(store.primaryGoals, "w_opt")}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.label, { color: colors.tabIconDefault }]}>
          {t("w_lbl_focus")}
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {getTranslatedList(store.eventFocus, "w_opt")}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.label, { color: colors.tabIconDefault }]}>
          {t("w_lbl_level")}
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {store.experienceLevel
            ? t(`w_opt_${store.experienceLevel}`)
            : t("w_not_specified")}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.label, { color: colors.tabIconDefault }]}>
          {t("w_lbl_reading")}
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {getThemeText()} | {getSizeText()}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.label, { color: colors.tabIconDefault }]}>
          {t("w_lbl_reminders")}
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {getTranslatedList(store.reminders, "w_opt")}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  iconWrapper: { alignItems: "center", marginBottom: 24 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 32 },
  summaryCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
    elevation: 2,
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 1,
  },
  value: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  divider: { height: 1, width: "100%", marginBottom: 16 },
});
