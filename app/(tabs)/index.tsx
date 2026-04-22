import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useTranslation } from 'react-i18next';
import { useThemeConfig } from '../../context/ThemeConfig';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeTab() {
  const { user } = useUser();
  const { t } = useTranslation();
  const { colors } = useThemeConfig();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <Image 
            source={{ uri: user?.imageUrl || 'https://via.placeholder.com/150' }} 
            style={styles.profileImage} 
          />
          <View style={styles.greetingBox}>
            <Text style={[styles.greeting, { color: colors.tabIconDefault }]}>
              {t('greeting_ayubowan')}
            </Text>
            <Text style={[styles.name, { color: colors.text }]}>
              {user?.firstName || 'Friend'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          {/* Notification Dot */}
          <View style={[styles.notificationDot, { backgroundColor: colors.tint }]} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.placeholderCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
          <Text style={[styles.placeholderText, { color: colors.tabIconDefault }]}>
            Home Feed Content...
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0', 
  },
  greetingBox: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 14,
    marginBottom: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bellBtn: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF', 
  },
  content: {
    padding: 24,
  },
  placeholderCard: {
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
  }
});
