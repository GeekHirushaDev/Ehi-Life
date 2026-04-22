import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeConfig } from "../../context/ThemeConfig";
import { LANGUAGE_KEY } from "../../i18n";
import { setItem } from "../../utils/storage";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const {
    colors: currentColors,
    toggleDarkMode,
    activeScheme,
  } = useThemeConfig();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const currentLanguage = i18n.language?.startsWith("si") ? "si" : "en";

  const selectLanguage = async (lng: "en" | "si") => {
    try {
      await setItem(LANGUAGE_KEY, lng);
      await i18n.changeLanguage(lng);
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(tabs)");
      } else {
        console.log(signInAttempt);
        Alert.alert("Error", "Sign in is not complete. Please try again.");
      }
    } catch (err: any) {
      Alert.alert(
        "Sign In Error",
        err.errors?.[0]?.longMessage ||
          err.errors?.[0]?.message ||
          "Sign in failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    try {
      const authSession = await startOAuthFlow?.({
        redirectUrl: Linking.createURL("/(auth)/sign-in", {
          scheme: "ehilife",
        }),
      });

      if (authSession?.createdSessionId) {
        await authSession.setActive?.({
          session: authSession.createdSessionId,
        });
        router.replace("/(tabs)");
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <TouchableOpacity style={styles.themeToggle} onPress={toggleDarkMode}>
        <Ionicons
          name={activeScheme === "dark" ? "sunny" : "moon"}
          size={28}
          color={currentColors.icon}
        />
      </TouchableOpacity>
      <View style={styles.innerContainer}>
        <View
          style={[
            styles.languageSwitcher,
            {
              backgroundColor: currentColors.inputBackground,
              borderColor: currentColors.border,
            },
          ]}
        >
          <Pressable
            style={[
              styles.languageChip,
              currentLanguage === "en" && {
                backgroundColor: currentColors.tint,
              },
            ]}
            onPress={() => selectLanguage("en")}
          >
            <Text
              style={[
                styles.languageChipText,
                {
                  color:
                    currentLanguage === "en" ? "#FFFFFF" : currentColors.text,
                },
              ]}
            >
              EN
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.languageChip,
              currentLanguage === "si" && {
                backgroundColor: currentColors.tint,
              },
            ]}
            onPress={() => selectLanguage("si")}
          >
            <Text
              style={[
                styles.languageChipText,
                {
                  color:
                    currentLanguage === "si" ? "#FFFFFF" : currentColors.text,
                },
              ]}
            >
              සි
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.title, { color: currentColors.text }]}>
          {t("welcome_back")}
        </Text>
        <Text style={[styles.subtitle, { color: currentColors.tint }]}>
          {t("sign_in_subtitle")}
        </Text>

        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder={t("email_placeholder")}
          placeholderTextColor={currentColors.tabIconDefault}
          onChangeText={(email) => setEmailAddress(email)}
          style={[
            styles.input,
            {
              backgroundColor: currentColors.inputBackground,
              borderColor: currentColors.border,
              color: currentColors.text,
            },
          ]}
        />
        <TextInput
          value={password}
          placeholder={t("password_placeholder")}
          placeholderTextColor={currentColors.tabIconDefault}
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
          style={[
            styles.input,
            {
              backgroundColor: currentColors.inputBackground,
              borderColor: currentColors.border,
              color: currentColors.text,
            },
          ]}
        />

        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: currentColors.tint },
          ]}
          onPress={onSignInPress}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? t("signing_in") : t("sign_in_button")}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View
            style={[styles.divider, { backgroundColor: currentColors.border }]}
          />
          <Text style={styles.dividerText}>{t("or")}</Text>
          <View
            style={[styles.divider, { backgroundColor: currentColors.border }]}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.googleButton,
            {
              backgroundColor: currentColors.googleButtonBG,
              borderColor: currentColors.border,
            },
            pressed && { opacity: 0.92, borderColor: currentColors.tint },
          ]}
          onPress={onGoogleSignIn}
        >
          <View style={styles.googleIconBadge}>
            <AntDesign name="google" size={16} color="#DB4437" />
          </View>
          <Text
            style={[
              styles.googleButtonText,
              { color: currentColors.googleButtonText },
            ]}
          >
            {t("continue_google")}
          </Text>
        </Pressable>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>{t("no_account")}</Text>
          <TouchableOpacity onPress={() => router.push("/sign-up")}>
            <Text style={[styles.footerLink, { color: currentColors.text }]}>
              {t("sign_up_link")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  themeToggle: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  innerContainer: { flex: 1, padding: 24, justifyContent: "center" },
  languageSwitcher: {
    alignSelf: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    gap: 6,
  },
  languageChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  languageChipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  primaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  divider: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 16, color: "#A0A0A0", fontSize: 14 },
  googleButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  googleIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    justifyContent: "center",
    alignItems: "center",
  },
  googleButtonText: { fontSize: 16, fontWeight: "600" },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: { color: "#A0A0A0", fontSize: 15 },
  footerLink: { fontSize: 15, fontWeight: "bold" },
});
