import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';
import { Audio } from 'expo-av';
import { useTranslation } from 'react-i18next';
import { useThemeConfig } from '../../../context/ThemeConfig';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../../../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RitualViewer() {
  const { id, startIndex } = useLocalSearchParams();
  const { colors } = useThemeConfig();
  const { t } = useTranslation();
  const langKey = i18n.language === 'si' ? 'si' : 'en';

  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Manage Active Iteration Step
  const parsedStart = startIndex ? parseInt(startIndex as string, 10) : 0;
  const [currentIndex, setCurrentIndex] = useState(isNaN(parsedStart) ? 0 : parsedStart);
  
  // Audio Playback
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchEventSteps = async () => {
      try {
        // Try Cache First
        const cached = await AsyncStorage.getItem('offline_EventSteps');
        if (cached) {
           const parsedData = JSON.parse(cached);
           const filtered = parsedData.filter((d: any) => d.eventId === id).sort((a: any, b: any) => a.stepNumber - b.stepNumber);
           if (filtered.length > 0) {
              setSteps(filtered);
              setLoading(false);
              return;
           }
        }
        
        // Fetch Live network
        const q = query(collection(db, "EventSteps"), where("eventId", "==", id), orderBy("stepNumber", "asc"));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
        setSteps(data);
      } catch (err) {
        console.error("Ritual Viewer Fetch Err", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEventSteps();
  }, [id]);

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  // Clean Sound State on page change
  useEffect(() => {
    if (sound) {
       sound.unloadAsync();
       setSound(null);
       setIsPlaying(false);
    }
  }, [currentIndex]);

  const togglePlayback = async (url: string) => {
    if (!sound) {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true },
          (status: any) => setIsPlaying(status.isLoaded && status.isPlaying)
        );
        setSound(newSound);
        setIsPlaying(true);
      } catch (e) {
        console.error("Ritual Audio Load Error:", e);
      }
      return;
    }
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      router.replace('/' as any);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
         <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (steps.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
         <Text style={{ color: colors.text }}>No Ritual Steps Found.</Text>
      </View>
    );
  }

  const step = steps[currentIndex];
  // Map large localized Gatha
  const gathaText = step[`gatha_${langKey}`] || step.gatha || step.si || '';
  const gathaDesc = step[`desc_${langKey}`] || step.desc || step.en || '';
  const isFinalStep = currentIndex === steps.length - 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ headerTitle: `Step ${currentIndex + 1} of ${steps.length}` }} />

      <ScrollView contentContainerStyle={styles.scroll}>
         <View style={[styles.stepBoundary, { borderColor: colors.tint }]}>
            <Text style={[styles.stepTag, { color: colors.tint }]}>
              {step.title || `Ritual Act ${currentIndex + 1}`}
            </Text>

            {!!gathaText && (
              <Text style={[styles.gathaRead, { color: colors.text }]}>
                {gathaText}
              </Text>
            )}

            {step.audioUrl && (
              <TouchableOpacity 
                style={[styles.audioBtn, { backgroundColor: colors.tint + '20' }]} 
                onPress={() => togglePlayback(step.audioUrl)}
              >
                 <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={32} color={colors.tint} />
                 <Text style={[styles.audioText, { color: colors.tint }]}>
                   {isPlaying ? "Pause Recitation" : "Listen to Recitation"}
                 </Text>
              </TouchableOpacity>
            )}

            {!!gathaDesc && (
              <View style={styles.descBox}>
                 <Text style={[styles.descMeaningLabel, { color: colors.tabIconDefault }]}>Meaning</Text>
                 <Text style={[styles.descText, { color: colors.text }]}>{gathaDesc}</Text>
              </View>
            )}
         </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
         <TouchableOpacity 
           style={[styles.actionBtn, { backgroundColor: isFinalStep ? '#34C759' : colors.tint }]} 
           onPress={handleNext}
           activeOpacity={0.8}
         >
            <Text style={styles.actionBtnText}>
              {isFinalStep ? "Finish Ritual" : "Next Step"}
            </Text>
            <Ionicons name={isFinalStep ? "checkmark-circle" : "arrow-forward-circle"} size={24} color="#FFF" />
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  stepBoundary: {
    borderLeftWidth: 4,
    paddingLeft: 20,
    marginVertical: 12,
  },
  stepTag: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  gathaRead: {
    fontSize: 26,
    lineHeight: 44,
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'center',
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
  },
  audioText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  descBox: {
    marginTop: 8,
  },
  descMeaningLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  descText: {
    fontSize: 16,
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: 16,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
