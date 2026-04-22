import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeConfig } from '../../context/ThemeConfig';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function Step3EventFocus() {
  const { t } = useTranslation();
  const { colors } = useThemeConfig();
  const { eventFocus, setField } = useOnboardingStore();

  const toggleFocus = (topic: string) => {
    if (eventFocus.includes(topic)) {
      setField('eventFocus', eventFocus.filter((g) => g !== topic));
    } else {
      setField('eventFocus', [...eventFocus, topic]);
    }
  };

  const options = [
    { id: 'bodhi', title: t("w_opt_bodhi"), icon: <FontAwesome5 name="tree" size={24} /> },
    { id: 'funerals', title: t("w_opt_funerals"), icon: <FontAwesome5 name="cloud-moon" size={24} /> },
    { id: 'weddings', title: t("w_opt_weddings"), icon: <FontAwesome5 name="ring" size={24} /> },
    { id: 'katina', title: t("w_opt_katina"), icon: <MaterialCommunityIcons name="tshirt-crew" size={28} /> },
    { id: 'almsgiving', title: t("w_opt_almsgiving"), icon: <FontAwesome5 name="hand-holding-heart" size={24} /> },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{t("w_title_step3")}</Text>

      {options.map((opt) => {
        const isSelected = eventFocus.includes(opt.id);
        const iconColor = isSelected ? colors.tint : colors.tabIconDefault;

        return (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.card,
              { backgroundColor: colors.inputBackground, borderColor: isSelected ? colors.tint : colors.border },
            ]}
            onPress={() => toggleFocus(opt.id)}
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
