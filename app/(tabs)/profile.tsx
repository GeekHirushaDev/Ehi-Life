import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useTranslation } from 'react-i18next';
import { useThemeConfig } from '../../context/ThemeConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileTab() {
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const { colors, toggleDarkMode, activeScheme } = useThemeConfig();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>{t('tab_profile')}</Text>
      
      <TouchableOpacity 
        style={[styles.actionBtn, { backgroundColor: colors.inputBackground, borderColor: colors.border }]} 
        onPress={toggleDarkMode}
      >
        <Ionicons name={activeScheme === 'dark' ? 'sunny' : 'moon'} size={24} color={colors.text} />
        <Text style={[styles.actionText, { color: colors.text }]}>Toggle Theme</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionBtn, { backgroundColor: colors.inputBackground, borderColor: colors.border, marginTop: 16 }]} 
        onPress={() => signOut()}
      >
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={[styles.actionText, { color: '#FF3B30' }]}>Sign Out</Text>
      </TouchableOpacity>
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
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  }
});
