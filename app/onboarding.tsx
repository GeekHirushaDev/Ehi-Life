import { useUser } from "@clerk/clerk-expo";
import {
    FontAwesome5,
    Ionicons,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../config/firebaseConfig";
import { useThemeConfig } from "../context/ThemeConfig";

export default function Onboarding() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useThemeConfig();
  const { user } = useUser();

  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const [mins, setMins] = useState<number | null>(null);
  const [level, setLevel] = useState("");
  const [saving, setSaving] = useState(false);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.id);
      await setDoc(
        userRef,
        {
          primaryGoal: goal,
          meditationTarget: mins,
          knowledgeLevel: level,
          onboardingCompleted: true,
        },
        { merge: true },
      );
      router.replace("/");
    } catch (err) {
      console.error("Error saving onboarding details", err);
    } finally {
      setSaving(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.questionText, { color: colors.text }]}>
        {t("onboarding_q1")}
      </Text>
      <TouchableOpacity
        style={[
          styles.optionCard,
          {
            backgroundColor: colors.inputBackground,
            borderColor: goal === "gathas" ? colors.tint : colors.border,
          },
        ]}
        onPress={() => setGoal("gathas")}
        activeOpacity={0.7}
      >
        <FontAwesome5
          name="book-reader"
          size={32}
          color={goal === "gathas" ? colors.tint : colors.tabIconDefault}
        />
        <Text style={[styles.optionText, { color: colors.text }]}>
          {t("goal_gathas")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.optionCard,
          {
            backgroundColor: colors.inputBackground,
            borderColor: goal === "habits" ? colors.tint : colors.border,
          },
        ]}
        onPress={() => setGoal("habits")}
        activeOpacity={0.7}
      >
        <Ionicons
          name="leaf"
          size={32}
          color={goal === "habits" ? colors.tint : colors.tabIconDefault}
        />
        <Text style={[styles.optionText, { color: colors.text }]}>
          {t("goal_habits")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.questionText, { color: colors.text }]}>
        {t("onboarding_q2")}
      </Text>
      {[5, 10, 30].map((val) => (
        <TouchableOpacity
          key={val}
          style={[
            styles.optionCard,
            {
              backgroundColor: colors.inputBackground,
              borderColor: mins === val ? colors.tint : colors.border,
            },
          ]}
          onPress={() => setMins(val)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="timer-outline"
            size={32}
            color={mins === val ? colors.tint : colors.tabIconDefault}
          />
          <Text style={[styles.optionText, { color: colors.text }]}>
            {t("target_mins", { mins: val })}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.questionText, { color: colors.text }]}>
        {t("onboarding_q3")}
      </Text>
      <TouchableOpacity
        style={[
          styles.optionCard,
          {
            backgroundColor: colors.inputBackground,
            borderColor: level === "beginner" ? colors.tint : colors.border,
          },
        ]}
        onPress={() => setLevel("beginner")}
        activeOpacity={0.7}
      >
        <FontAwesome5
          name="seedling"
          size={32}
          color={level === "beginner" ? colors.tint : colors.tabIconDefault}
        />
        <Text style={[styles.optionText, { color: colors.text }]}>
          {t("level_beginner")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.optionCard,
          {
            backgroundColor: colors.inputBackground,
            borderColor: level === "intermediate" ? colors.tint : colors.border,
          },
        ]}
        onPress={() => setLevel("intermediate")}
        activeOpacity={0.7}
      >
        <FontAwesome5
          name="tree"
          size={32}
          color={level === "intermediate" ? colors.tint : colors.tabIconDefault}
        />
        <Text style={[styles.optionText, { color: colors.text }]}>
          {t("level_inter")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const progress = (step / 3) * 100;
  const isNextDisabled =
    (step === 1 && !goal) || (step === 2 && !mins) || (step === 3 && !level);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <View
          style={[styles.progressTrack, { backgroundColor: colors.border }]}
        >
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.tint, width: `${progress}%` },
            ]}
          />
        </View>
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              backgroundColor: isNextDisabled
                ? colors.tabIconDefault
                : colors.tint,
            },
          ]}
          disabled={isNextDisabled || saving}
          onPress={step === 3 ? handleFinish : handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {step === 3
              ? saving
                ? t("loading") || "Saving..."
                : t("btn_finish")
              : t("btn_next")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 32, paddingTop: 40 },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    width: "100%",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 5 },
  stepContainer: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  questionText: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
    gap: 16,
  },
  optionText: { fontSize: 18, fontWeight: "700" },
  footer: { padding: 32 },
  primaryButton: {
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
});
