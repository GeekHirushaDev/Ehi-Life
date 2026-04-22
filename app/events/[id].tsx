import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebaseConfig';
import { useThemeConfig } from '../../context/ThemeConfig';
import i18n from '../../i18n';

export default function EventHub() {
  const { id } = useLocalSearchParams();
  const { colors } = useThemeConfig();
  const { t } = useTranslation();
  const langKey = i18n.language === 'si' ? 'si' : 'en';

  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const stepsRef = collection(db, "EventSteps");
        const q = query(
          stepsRef,
          where("eventId", "==", id),
          orderBy("stepNumber", "asc")
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
        setSteps(data);
      } catch (err) {
        console.error("Failed loading event steps", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSteps();
  }, [id]);

  const eventTitle = t(`action_${id}`);
  const eventDesc = t(`desc_${id}`);

  const handleStepPress = (stepLink?: string) => {
    if (stepLink) {
      router.push(`/library/${stepLink}` as any);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ headerTitle: eventTitle }} />

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Description Section */}
        <View style={[styles.descCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
          <Text style={[styles.descTitle, { color: colors.text }]}>What is this meaning?</Text>
          <Text style={[styles.descText, { color: colors.text }]}>{eventDesc !== `desc_${id}` ? eventDesc : 'A standard traditional event guiding Buddhists globally toward mindful adherence.'}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Required Ritual Steps</Text>

        {/* Steps List */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 40 }} />
        ) : steps.length === 0 ? (
          <View style={[styles.emptyBox, { borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>No specific steps documented for this event yet.</Text>
          </View>
        ) : (
          steps.map((step, idx) => {
            const stepTitle = step[langKey] || step.en || step.title || `Step ${step.stepNumber}`;
            const stepDesc = step[`desc_${langKey}`] || step.desc || '';

            return (
              <TouchableOpacity
                key={step.docId}
                style={[styles.stepRow, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
                activeOpacity={0.7}
                onPress={() => handleStepPress(step.stepDocumentLink || step.libraryId)}
              >
                <View style={[styles.stepCircle, { backgroundColor: colors.tint }]}>
                  <Text style={styles.stepNum}>{step.stepNumber || idx + 1}</Text>
                </View>

                <View style={styles.stepBody}>
                  <Text style={[styles.stepTitle, { color: colors.tint }]}>{stepTitle}</Text>
                  {!!stepDesc && (
                    <Text style={[styles.stepSub, { color: colors.text }]} numberOfLines={2}>
                      {stepDesc}
                    </Text>
                  )}
                </View>

                <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  descCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
    elevation: 2,
  },
  descTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descText: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.85,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyBox: {
    padding: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNum: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepBody: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepSub: {
    fontSize: 13,
    opacity: 0.8,
  }
});
