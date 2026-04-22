import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    FadeInLeft,
    FadeInRight,
    FadeOutLeft,
    FadeOutRight,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../../config/firebaseConfig";
import { useThemeConfig } from "../../context/ThemeConfig";
import i18n, { LANGUAGE_KEY } from "../../i18n";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { setItem } from "../../utils/storage";

import Step1Language from "../../components/wizard/Step1Language";
import Step2Goal from "../../components/wizard/Step2Goal";
import Step3EventFocus from "../../components/wizard/Step3EventFocus";
import Step4Experience from "../../components/wizard/Step4Experience";
import Step5Reading from "../../components/wizard/Step5Reading";
import Step6Reminders from "../../components/wizard/Step6Reminders";
import Step7Summary from "../../components/wizard/Step7Summary";

export default function Wizard() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, toggleDarkMode, activeScheme } = useThemeConfig();
  const store = useOnboardingStore();
  const { user } = useUser();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const handleNext = async () => {
    if (step < 7) {
      setDirection("forward");
      setStep(step + 1);
    } else {
      try {
        store.setField("onboardingCompleted", true);
        await setItem("wizardCompleted", "true");
        await setItem(LANGUAGE_KEY, store.language || "en");

        if (user?.id) {
          await setDoc(
            doc(db, "users", user.id),
            {
              onboardingCompleted: true,
              languagePref: store.language || "en",
            },
            { merge: true },
          );
        }
      } catch (error) {
        console.error("Failed completing wizard", error);
      } finally {
        if (user?.id) {
          router.replace("/(tabs)");
        } else {
          router.replace("/sign-in");
        }
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection("backward");
      setStep(step - 1);
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && !store.language) return true;
    if (step === 2 && store.primaryGoals.length === 0) return true;
    if (step === 3 && store.eventFocus.length === 0) return true;
    if (step === 4 && store.experienceLevel === "") return true;
    if (
      step === 6 &&
      store.reminders.length === 0 &&
      !store.reminders.includes("skip")
    )
      return false;
    return false;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1Language />;
      case 2:
        return <Step2Goal />;
      case 3:
        return <Step3EventFocus />;
      case 4:
        return <Step4Experience />;
      case 5:
        return <Step5Reading />;
      case 6:
        return <Step6Reminders />;
      case 7:
        return <Step7Summary />;
      default:
        return null;
    }
  };

  const progress = (step / 7) * 100;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.topRightControls}>
        <TouchableOpacity
          style={styles.globalToggleBtn}
          onPress={() => {
            const newLang = store.language === "en" ? "si" : "en";
            store.setField("language", newLang);
            i18n.changeLanguage(newLang);
          }}
        >
          <Text
            style={{ fontSize: 16, fontWeight: "bold", color: colors.text }}
          >
            {store.language === "en" ? "සිං" : "EN"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.globalToggleBtn}
          onPress={toggleDarkMode}
        >
          <Ionicons
            name={activeScheme === "dark" ? "sunny" : "moon"}
            size={24}
            color={colors.icon}
          />
        </TouchableOpacity>
      </View>

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

      <View style={styles.stepContainer}>
        <Animated.View
          key={step}
          entering={direction === "forward" ? FadeInRight : FadeInLeft}
          exiting={direction === "forward" ? FadeOutLeft : FadeOutRight}
          style={StyleSheet.absoluteFill}
        >
          {renderStep()}
        </Animated.View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        {step > 1 ? (
          <TouchableOpacity
            style={[
              styles.footerBtn,
              styles.backBtn,
              { borderColor: colors.border },
            ]}
            onPress={handleBack}
          >
            <Text style={[styles.backBtnText, { color: colors.text }]}>
              {t("btn_back")}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <TouchableOpacity
          style={[
            styles.footerBtn,
            styles.nextBtn,
            {
              backgroundColor: isNextDisabled()
                ? colors.tabIconDefault
                : colors.tint,
            },
          ]}
          disabled={isNextDisabled()}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>
            {step === 7 ? t("w_continue_login") : t("btn_next")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRightControls: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  globalToggleBtn: {
    padding: 8,
  },
  header: { padding: 24, paddingTop: 60 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    width: "100%",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  stepContainer: { flex: 1, position: "relative" },
  footer: {
    flexDirection: "row",
    padding: 24,
    borderTopWidth: 1,
    gap: 16,
  },
  footerBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  nextBtn: {
    flex: 1,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
