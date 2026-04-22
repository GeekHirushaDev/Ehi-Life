import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeConfig } from '../../context/ThemeConfig';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { FontAwesome5 } from '@expo/vector-icons';

export default function Step4Experience() {
  const { t } = useTranslation();
  const { colors } = useThemeConfig();
  const { experienceLevel, setField } = useOnboardingStore();

  const handleSelect = (level: string) => {
    setField('experienceLevel', level);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{t("w_title_step4")}</Text>

      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.inputBackground, borderColor: experienceLevel === 'beginner' ? colors.tint : colors.border },
        ]}
        onPress={() => handleSelect('beginner')}
        activeOpacity={0.7}
      >
        <FontAwesome5 name="seedling" size={32} color={experienceLevel === 'beginner' ? colors.tint : colors.tabIconDefault} />
        <Text style={[styles.cardText, { color: colors.text }]}>{t("w_opt_beginner")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.inputBackground, borderColor: experienceLevel === 'familiar' ? colors.tint : colors.border },
        ]}
        onPress={() => handleSelect('familiar')}
        activeOpacity={0.7}
      >
        <FontAwesome5 name="tree" size={32} color={experienceLevel === 'familiar' ? colors.tint : colors.tabIconDefault} />
        <Text style={[styles.cardText, { color: colors.text }]}>{t("w_opt_familiar")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  card: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
    alignItems: 'center',
    gap: 16,
  },
  cardText: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
});
