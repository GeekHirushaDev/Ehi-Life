import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useTranslation } from 'react-i18next';
import { useThemeConfig } from '../../context/ThemeConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import i18n from '../../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

export default function ProfileTab() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { t } = useTranslation();
  const { colors, toggleDarkMode, activeScheme } = useThemeConfig();
  const store = useOnboardingStore();
  
  const [downloading, setDownloading] = useState(false);

  const handleLanguageToggle = async () => {
    const newLang = store.language === 'en' ? 'si' : 'en';
    store.setField('language', newLang);
    i18n.changeLanguage(newLang);
    await AsyncStorage.setItem('profile_lang', newLang);
  };

  const handleOfflineSync = async () => {
    setDownloading(true);
    try {
      const eventSnap = await getDocs(query(collection(db, "EventSteps"), limit(300)));
      const librarySnap = await getDocs(query(collection(db, "LibraryItems"), limit(200)));
      
      const eventsData = eventSnap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      const libsData = librarySnap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));

      await AsyncStorage.setItem('offline_EventSteps', JSON.stringify(eventsData));
      await AsyncStorage.setItem('offline_LibraryItems', JSON.stringify(libsData));
      
      Alert.alert("Sync Complete", "All Guides and Gathas are now heavily cached for offline temple use!");
    } catch (err) {
      console.error("Offline Sync Error", err);
      Alert.alert("Sync Failed", "Could not download data. Check internet connection.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* User Card */}
        <View style={styles.profileHeader}>
           <Image 
             source={{ uri: user?.imageUrl || 'https://via.placeholder.com/150' }} 
             style={styles.avatar} 
           />
           <Text style={[styles.name, { color: colors.text }]}>
             {user?.fullName || user?.firstName || 'Dhamma Companion'}
           </Text>
           <Text style={[styles.email, { color: colors.tabIconDefault }]}>
             {user?.primaryEmailAddress?.emailAddress}
           </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>

        <View style={[styles.card, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={toggleDarkMode}>
            <View style={[styles.iconBox, { backgroundColor: colors.tint + '15' }]}>
               <Ionicons name={activeScheme === 'dark' ? 'sunny' : 'moon'} size={22} color={colors.tint} />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Toggle Theme</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.actionBtn} onPress={handleLanguageToggle}>
            <View style={[styles.iconBox, { backgroundColor: colors.tint + '15' }]}>
               <Ionicons name="language" size={22} color={colors.tint} />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>
              {t('profile_language')} ({store.language === 'en' ? 'English' : 'සිංහල'})
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>Offline Mode</Text>
        
        <View style={[styles.card, { backgroundColor: colors.inputBackground, borderColor: colors.border, padding: 16 }]}>
           <Text style={{ fontSize: 13, color: colors.tabIconDefault, marginBottom: 16, lineHeight: 20 }}>
             Ensure interrupted access to step-by-step guides inside rural temples where networks drop by pre-syncing all documents onto your device locally.
           </Text>
           <TouchableOpacity 
             style={[styles.syncBtn, { backgroundColor: colors.tint }]} 
             onPress={handleOfflineSync}
             disabled={downloading}
           >
              {downloading ? (
                <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
              ) : (
                <Ionicons name="cloud-download-outline" size={24} color="#FFF" style={{ marginRight: 8 }} />
              )}
              <Text style={styles.syncBtnText}>
                {downloading ? "Syncing..." : "Download Guides for Offline"}
              </Text>
           </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: colors.inputBackground, borderColor: colors.border }]} 
          onPress={() => signOut()}
        >
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          <Text style={[styles.logoutText, { color: '#FF3B30' }]}>Sign Out Securely</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24 },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
    backgroundColor: '#E0E0E0',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginLeft: 72,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
  },
  syncBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 32,
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  }
});
