import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemeConfig } from '../../context/ThemeConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventsTab() {
  const { t } = useTranslation();
  const { colors } = useThemeConfig();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>{t('tab_events')}</Text>
      
      <View style={[styles.card, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
        <Text style={[styles.text, { color: colors.tabIconDefault }]}>
          Events library loading...
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  text: {
    fontSize: 16,
  }
});
