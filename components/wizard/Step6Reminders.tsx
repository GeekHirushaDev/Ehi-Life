import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeConfig } from '../../context/ThemeConfig';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Ionicons } from '@expo/vector-icons';

export default function Step6Reminders() {
  const { t } = useTranslation();
  const { colors } = useThemeConfig();
  const { reminders, setField } = useOnboardingStore();

  const toggleReminder = (rem: string) => {
    if (rem === 'skip') {
      setField('reminders', ['skip']);
      return;
    }
    
    let newRems = reminders.filter(r => r !== 'skip');
    if (newRems.includes(rem)) {
      newRems = newRems.filter((g) => g !== rem);
    } else {
      newRems = [...newRems, rem];
    }
    setField('reminders', newRems);
  };

  const options = [
    { id: 'poya', title: t("w_opt_poya"), icon: <Ionicons name="moon" size={28} /> },
    { id: 'daily_med', title: t("w_opt_daily_med"), icon: <Ionicons name="time" size={28} /> },
    { id: 'skip', title: t("w_opt_skip"), icon: <Ionicons name="close-circle" size={28} /> },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{t("w_title_step6")}</Text>

      {options.map((opt) => {
        const isSelected = reminders.includes(opt.id);
        const iconColor = isSelected ? colors.tint : colors.tabIconDefault;

        return (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.card,
              { backgroundColor: colors.inputBackground, borderColor: isSelected ? colors.tint : colors.border },
            ]}
            onPress={() => toggleReminder(opt.id)}
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
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
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
  cardText: { fontSize: 18, fontWeight: '600', flex: 1 },
});
