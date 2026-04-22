import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useTranslation } from 'react-i18next';
import { useThemeConfig } from '../../context/ThemeConfig';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import i18n from '../../i18n';

type HabitKeys = "pansil" | "meditation" | "offerings";

export default function HomeTab() {
  const { user } = useUser();
  const { t } = useTranslation();
  const { colors } = useThemeConfig();

  const [habits, setHabits] = useState<Record<HabitKeys, boolean>>({
    pansil: false,
    meditation: false,
    offerings: false
  });
  
  const [dailyQuote, setDailyQuote] = useState<string>('');

  const today = new Date().toISOString().split('T')[0];
  const langKey = i18n.language === 'si' ? 'si' : 'en';

  useEffect(() => {
    // 1. Fetch Quote
    const fetchQuote = async () => {
      try {
        const quoteRef = doc(db, "daily_quotes", today);
        const quoteSnap = await getDoc(quoteRef);
        if (quoteSnap.exists()) {
          const data = quoteSnap.data();
          setDailyQuote(data[langKey] || data['en'] || t('home_quote_sample'));
        } else {
          setDailyQuote(t('home_quote_sample'));
        }
      } catch (err) {
        setDailyQuote(t('home_quote_sample'));
      }
    };
    fetchQuote();

    // 2. Fetch Habits
    if (!user?.id) return;
    const fetchHabits = async () => {
      try {
        const docRef = doc(db, "users", user.id, "habits", today);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHabits(docSnap.data() as Record<HabitKeys, boolean>);
        }
      } catch (err) {
        console.error("Failed to load daily habits", err);
      }
    };
    fetchHabits();
  }, [user?.id, today, langKey]);

  const toggleHabit = async (key: HabitKeys) => {
    const newState = { ...habits, [key]: !habits[key] };
    setHabits(newState);

    if (user?.id) {
      try {
        const docRef = doc(db, "users", user.id, "habits", today);
        await setDoc(docRef, newState, { merge: true });
      } catch (err) {
        console.error("Failed to sync habit", err);
      }
    }
  };

  const renderQuickAction = (iconLib: any, iconName: string, titleKey: string) => (
    <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }]} activeOpacity={0.7}>
       <View style={[styles.actionIconWrapper, { backgroundColor: colors.tint + '15' }]}>
         {React.createElement(iconLib, { name: iconName, size: 28, color: colors.tint })}
       </View>
       <Text style={[styles.actionText, { color: colors.text }]} numberOfLines={2}>
         {t(titleKey)}
       </Text>
    </TouchableOpacity>
  );

  const renderHabitRow = (key: HabitKeys, translationKey: string) => {
    const isCompleted = habits[key];
    return (
      <TouchableOpacity 
        key={key} 
        style={[styles.habitRow, { backgroundColor: colors.inputBackground, borderColor: isCompleted ? colors.tint : colors.border }]}
        onPress={() => toggleHabit(key)}
        activeOpacity={0.7}
      >
        <Text style={[styles.habitText, { color: colors.text, textDecorationLine: isCompleted ? "line-through" : "none" }]}>
          {t(translationKey)}
        </Text>
        <View style={styles.checkbox}>
          <Ionicons 
            name={isCompleted ? "checkmark-circle" : "ellipse-outline"} 
            size={28} 
            color={isCompleted ? colors.tint : colors.tabIconDefault} 
          />
        </View>
      </TouchableOpacity>
    );
  };

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
          <View style={[styles.notificationDot, { backgroundColor: colors.tint }]} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Quick Actions ScrollView */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('quick_actions_title')}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
           {renderQuickAction(FontAwesome5, 'cloud-moon', 'action_funeral')}
           {renderQuickAction(FontAwesome5, 'tree', 'action_bodhipuja')}
           {renderQuickAction(FontAwesome5, 'ring', 'action_wedding')}
           {renderQuickAction(MaterialCommunityIcons, 'hand-heart', 'action_almsgiving')}
        </ScrollView>
        
        {/* Daily Quote Card */}
        <View style={[styles.quoteCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
          <View style={styles.quoteHeader}>
            <FontAwesome5 name="quote-left" size={16} color={colors.tint} />
            <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: 8 }]}>
              {t('home_quote_title')}
            </Text>
          </View>
          <Text style={[styles.quoteText, { color: colors.text }]}>
            "{dailyQuote}"
          </Text>
        </View>

        {/* Simplified Daily Practice */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('home_habit_title')}
          </Text>
        </View>

        <View style={styles.habitsWrapper}>
          {renderHabitRow('pansil', 'habit_pansil')}
          {renderHabitRow('meditation', 'habit_meditation')}
          {renderHabitRow('offerings', 'habit_offerings')}
        </View>
        
        {/* Padding for FAB spacing */}
        <View style={{ height: 60 }} />
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
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileImage: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E0E0E0' },
  greetingBox: { justifyContent: 'center' },
  greeting: { fontSize: 14, marginBottom: 2 },
  name: { fontSize: 18, fontWeight: 'bold' },
  bellBtn: { position: 'relative', padding: 8, borderRadius: 20 },
  notificationDot: {
    position: 'absolute', top: 6, right: 8, width: 10, height: 10,
    borderRadius: 5, borderWidth: 2, borderColor: '#FFF'
  },
  content: { padding: 24, paddingTop: 12 },
  
  // Quick Actions
  actionsScroll: {
    paddingBottom: 24,
    gap: 16,
  },
  actionCard: {
    width: 120,
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },

  // Quote Card
  quoteCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
    elevation: 2,
    marginBottom: 32,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderWrap: { marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },

  // Habit Tracker
  habitsWrapper: {
    gap: 12,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  habitText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  checkbox: {
    marginLeft: 8,
  }
});
