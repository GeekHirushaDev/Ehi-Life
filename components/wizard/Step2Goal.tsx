import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeConfig } from '../../context/ThemeConfig';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

export default function Step2Goal() {
  const { t } = useTranslation();
  const { colors } = useThemeConfig();
  const { primaryGoals, setField } = useOnboardingStore();

  const toggleGoal = (goal: string) => {
    if (primaryGoals.includes(goal)) {
      setField('primaryGoals', primaryGoals.filter((g) => g !== goal));
    } else {
      setField('primaryGoals', [...primaryGoals, goal]);
    }
  };

  const options = [
    { id: 'daily', title: t("w_opt_daily"), icon: <Ionicons name="leaf" size={28} /> },
    { id: 'events', title: t("w_opt_events"), icon: <FontAwesome5 name="users" size={24} /> },
    { id: 'reading', title: t("w_opt_reading"), icon: <FontAwesome5 name="book-reader" size={24} /> },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{t("w_title_step2")}</Text>
      <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>{t("w_sub_step2")}</Text>

      {options.map((opt) => {
        const isSelected = primaryGoals.includes(opt.id);
        const iconColor = isSelected ? colors.tint : colors.tabIconDefault;

        return (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.card,
              { backgroundColor: colors.inputBackground, borderColor: isSelected ? colors.tint : colors.border },
            ]}
            onPress={() => toggleGoal(opt.id)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              {React.cloneElement(opt.icon as React.ReactElement<{ color: string }>, { color: iconColor })}
            </View>
            <Text style={[styles.cardText, { color: colors.text }]}>{opt.title}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
    gap: 16,
  },
  iconContainer: { width: 40, alignItems: 'center' },
  cardText: { fontSize: 18, fontWeight: '600' },
});
