import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useTranslation } from 'react-i18next';
import { useThemeConfig } from '../../context/ThemeConfig';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { router } from 'expo-router';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [latestEvents, setLatestEvents] = useState<any[]>([]);
  
  const [logActionType, setLogActionType] = useState<"meditation" | "good_deed" | "temple" | null>(null);
  const [inputValue, setInputValue] = useState("");

  const today = new Date().toISOString().split('T')[0];
  const langKey = i18n.language === 'si' ? 'si' : 'en';

  useEffect(() => {
    const fetchDashboardParams = async () => {
      try {
        const userId = user?.id;
        if (!userId) return;
        const ref = doc(db, "users", userId, "habits", today);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setHabits(snap.data() as any);
        }
      } catch (e) {
        console.error("Failed to load daily habits", e);
      }
      
      try {
        import('firebase/firestore').then(({ collection, query, getDocs }) => {
           getDocs(query(collection(db, "UpcomingEvents"))).then(evSnap => {
              const evData = evSnap.docs.map(d => ({ docId: d.id, ...d.data() }));
              setLatestEvents(evData);
           }).catch(e => console.error("Failed to load upcoming events", e));
        });
      } catch (e) {}

      try {
        const quoteSnap = await getDoc(doc(db, "daily_quotes", today));
        if (quoteSnap.exists()) {
           const data = quoteSnap.data();
           setDailyQuote(data[langKey] || data['en'] || data['text'] || t('home_quote_sample'));
        } else {
           setDailyQuote(t('home_quote_sample'));
        }
      } catch (e) {
        setDailyQuote(t('home_quote_sample'));
      }
    };

    fetchDashboardParams();
  }, [user?.id, today, langKey]);

  const toggleHabit = async (key: HabitKeys, overrideValue: boolean = false) => {
    const newVal = overrideValue ? true : !habits[key];
    const newState = { ...habits, [key]: newVal };
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

  const handlePansil = async () => {
    setModalVisible(false);
    if(user?.id) {
       try {
         await addDoc(collection(db, "UserLogs"), {
             userId: user.id, type: "pansil", timestamp: new Date().toISOString(), date: today
         });
         await toggleHabit("pansil", true);
       } catch(e) {}
    }
    Alert.alert("Sadhu Sadhu!", t('toast_pansil_success'));
  };

  const handleOpenLog = (type: "meditation" | "good_deed" | "temple") => {
    setModalVisible(false);
    setInputValue("");
    setLogActionType(type);
  };

  const saveLog = async () => {
    if(user?.id && logActionType) {
       try {
         await addDoc(collection(db, "UserLogs"), {
             userId: user.id, type: logActionType, value: inputValue, timestamp: new Date().toISOString(), date: today
         });
         if(logActionType === "meditation") {
             await toggleHabit("meditation", true);
             Alert.alert("Sadhu!", t('toast_meditation_success'));
         } else if(logActionType === "good_deed") {
             await toggleHabit("offerings", true);
             Alert.alert("Sadhu!", t('toast_deed_success'));
         } else if(logActionType === "temple") {
             Alert.alert("Sadhu!", t('toast_temple_success'));
         }
       } catch(e) {}
    }
    setLogActionType(null);
  };

  const openEvent = (id: string) => {
     router.push(`/events/${id}` as any);
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
        
        <View style={styles.sectionHeaderWrap}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('quick_actions_title')}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
           {latestEvents.length === 0 ? (
              <View style={[styles.actionCard, { backgroundColor: colors.inputBackground, borderColor: colors.border, width: 250, justifyContent: 'center' }]}>
                 <Text style={{color: colors.tabIconDefault, textAlign: 'center'}}>No upcoming events.</Text>
              </View>
           ) : (
              latestEvents.map((evt) => (
                 <TouchableOpacity 
                   key={evt.docId} 
                   style={[styles.actionCard, { backgroundColor: colors.inputBackground, borderColor: colors.border, width: 220, padding: 16, alignItems: 'flex-start' }]} 
                   activeOpacity={0.7}
                   onPress={() => openEvent(evt.eventId || evt.docId)}
                 >
                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
                       <Ionicons name="location-outline" size={16} color={colors.tint} style={{marginRight: 4}} />
                       <Text style={{color: colors.tint, fontWeight: 'bold', fontSize: 15}} numberOfLines={1}>
                         {evt.title || evt[langKey] || evt.en || 'Special Event'}
                       </Text>
                    </View>
                    <Text style={{color: colors.text, fontSize: 13, opacity: 0.85, flex: 1, lineHeight: 18}} numberOfLines={2}>
                      {evt.desc || evt[`desc_${langKey}`] || evt.description || ''}
                    </Text>
                    {!!evt.date && (
                       <Text style={{color: colors.tabIconDefault, fontSize: 12, marginTop: 12, fontWeight: '600'}}>
                         {evt.date}
                       </Text>
                    )}
                 </TouchableOpacity>
              ))
           )}
        </ScrollView>
        
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

        <View style={{ height: 60 }} />
      </ScrollView>

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.tint }]} 
        onPress={() => setModalVisible(true)} 
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
           <TouchableOpacity activeOpacity={1} style={[styles.modalContent, { backgroundColor: colors.background }]}>
               <View style={styles.gridContainer}>
                 <TouchableOpacity style={[styles.gridItem, { backgroundColor: colors.inputBackground }]} onPress={() => handleOpenLog("meditation")}>
                    <Ionicons name="flower-outline" size={32} color={colors.tint} />
                    <Text style={[styles.gridText, { color: colors.text }]}>{t('action_log_meditation')}</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.gridItem, { backgroundColor: colors.inputBackground }]} onPress={() => handleOpenLog("good_deed")}>
                    <Ionicons name="heart-half-outline" size={32} color={colors.tint} />
                    <Text style={[styles.gridText, { color: colors.text }]}>{t('action_log_gooddeed')}</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.gridItem, { backgroundColor: colors.inputBackground }]} onPress={handlePansil}>
                    <Ionicons name="body-outline" size={32} color={colors.tint} />
                    <Text style={[styles.gridText, { color: colors.text }]}>{t('action_log_pansil')}</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.gridItem, { backgroundColor: colors.inputBackground }]} onPress={() => handleOpenLog("temple")}>
                    <Ionicons name="star-outline" size={32} color={colors.tint} />
                    <Text style={[styles.gridText, { color: colors.text }]}>{t('action_log_temple')}</Text>
                 </TouchableOpacity>
              </View>
           </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Action Input Modal */}
      <Modal visible={!!logActionType} transparent animationType="slide" onRequestClose={() => setLogActionType(null)}>
         <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLogActionType(null)}>
            <TouchableOpacity activeOpacity={1} style={[styles.modalContent, { backgroundColor: colors.background, paddingBottom: 40 }]}>
               <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>
                  {logActionType === 'meditation' ? t('prompt_minutes_meditated') : 
                   logActionType === 'good_deed' ? t('prompt_describe_deed') : 
                   t('prompt_temple_name')}
               </Text>
               
               {/* Use native TextInput directly ignoring unused React-Native imports gracefully capturing text safely */}
               <View style={{ backgroundColor: colors.inputBackground, borderRadius: 12, paddingHorizontal: 16, paddingVertical: logActionType === 'good_deed' ? 12 : 0, borderWidth: 1, borderColor: colors.border, marginBottom: 24 }}>
                  {React.createElement(require('react-native').TextInput, {
                     style: { color: colors.text, fontSize: 16, minHeight: logActionType === 'good_deed' ? 80 : 50 },
                     placeholder: t('prompt_input_placeholder') || 'Enter...',
                     placeholderTextColor: colors.tabIconDefault,
                     value: inputValue,
                     onChangeText: setInputValue,
                     keyboardType: logActionType === 'meditation' ? 'numeric' : 'default',
                     multiline: logActionType === 'good_deed',
                     textAlignVertical: logActionType === 'good_deed' ? 'top' : 'center'
                  })}
               </View>

               <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <TouchableOpacity style={{ flex: 1, padding: 16, alignItems: 'center', backgroundColor: colors.inputBackground, borderRadius: 12, marginRight: 8 }} onPress={() => setLogActionType(null)}>
                     <Text style={{color: colors.text, fontWeight: 'bold'}}>{t('btn_cancel_log')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={{ flex: 1, padding: 16, alignItems: 'center', backgroundColor: colors.tint, borderRadius: 12, marginLeft: 8 }} onPress={saveLog}>
                     <Text style={{color: '#FFF', fontWeight: 'bold'}}>{t('btn_save_log')}</Text>
                  </TouchableOpacity>
               </View>
            </TouchableOpacity>
         </TouchableOpacity>
      </Modal>
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
  quoteCard: {
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    marginBottom: 32,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 100,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  gridItem: {
    width: '47%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0, 
  },
  gridText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
