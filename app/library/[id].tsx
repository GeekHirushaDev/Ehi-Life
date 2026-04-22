import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useThemeConfig } from '../../context/ThemeConfig';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

export default function LibraryDetail() {
  const { id } = useLocalSearchParams();
  const { colors } = useThemeConfig();
  const { t } = useTranslation();
  const langKey = i18n.language === 'si' ? 'si' : 'en';

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const docRef = doc(db, "LibraryItems", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setItem(docSnap.data());
        }
      } catch (err) {
        console.error("Fetch Detail Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 1);
      setIsPlaying(status.isPlaying);
    }
  };

  const initAudio = async (url: string) => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setIsPlaying(true);
    } catch (e) {
      console.error("Audio Load Error:", e);
    }
  };

  const togglePlayback = async () => {
    if (!sound) {
      if (item?.audioUrl) initAudio(item.audioUrl);
      return;
    }
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const handleSliderValueChange = async (val: number) => {
    if (sound) {
      await sound.setPositionAsync(val);
    }
  };

  const increaseFont = () => setFontSize(prev => Math.min(prev + 2, 40));
  const decreaseFont = () => setFontSize(prev => Math.max(prev - 2, 12));

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Document Not Found</Text>
      </View>
    );
  }

  const displayTitle = item.title || 'Dhamma Content';
  const displayContent = item[langKey] || item.content || item.en || '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerTitle: displayTitle,
          headerRight: () => (
            <View style={styles.headerBtns}>
              <TouchableOpacity onPress={decreaseFont} style={styles.btnA}>
                <Text style={{ fontSize: 16, color: colors.tint, fontWeight: 'bold' }}>A-</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={increaseFont} style={styles.btnA}>
                <Text style={{ fontSize: 22, color: colors.tint, fontWeight: 'bold' }}>A+</Text>
              </TouchableOpacity>
            </View>
          )
        }} 
      />

      {item.audioUrl ? (
        <View style={[styles.audioContainer, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
          <TouchableOpacity style={[styles.playBtn, { backgroundColor: colors.tint }]} onPress={togglePlayback}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#FFF" style={{ marginLeft: isPlaying ? 0 : 3 }} />
          </TouchableOpacity>
          <View style={styles.sliderWrap}>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={handleSliderValueChange}
              minimumTrackTintColor={colors.tint}
              maximumTrackTintColor={colors.tabIconDefault}
              thumbTintColor={colors.tint}
            />
          </View>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.content, { color: colors.text, fontSize, lineHeight: fontSize * 1.6 }]}>
          {displayContent}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBtns: { flexDirection: 'row', alignItems: 'center', gap: 16, marginRight: 8 },
  btnA: { paddingHorizontal: 4 },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    elevation: 2,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sliderWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  content: {
    textAlign: 'justify',
  }
});
