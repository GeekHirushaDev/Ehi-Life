import { useOAuth, useSignUp } from "@clerk/clerk-expo";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
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

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const {
    colors: currentColors,
    toggleDarkMode,
    activeScheme,
  } = useThemeConfig();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
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

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors?.[0]?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/(tabs)");
      } else {
        console.log(completeSignUp);
        Alert.alert("Error", "Validation not complete.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors?.[0]?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignUp = async () => {
    if (!isLoaded) return;

    try {
      const authSession = await startOAuthFlow?.({
        redirectUrl: Linking.createURL("/(auth)/sign-up", {
          scheme: "ehilife",
        }),
      });

      if (authSession?.createdSessionId) {
        await authSession.setActive?.({
          session: authSession.createdSessionId,
        });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      console.error("OAuth sign up error", err);
      Alert.alert(
        "Error",
        err?.errors?.[0]?.message || "Google sign up failed",
      );
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
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
                        currentLanguage === "en"
                          ? "#FFFFFF"
                          : currentColors.text,
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
                        currentLanguage === "si"
                          ? "#FFFFFF"
                          : currentColors.text,
                    },
                  ]}
                >
                  සි
                </Text>
              </Pressable>
            </View>

            {!pendingVerification ? (
              <>
                <Text style={[styles.title, { color: currentColors.text }]}>
                  {t("create_account")}
                </Text>
                <Text style={[styles.subtitle, { color: currentColors.tint }]}>
                  {t("begin_experience")}
                </Text>

                <TextInput
                  autoCapitalize="words"
                  value={firstName}
                  placeholder={t("first_name")}
                  placeholderTextColor={currentColors.tabIconDefault}
                  onChangeText={(name) => setFirstName(name)}
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
                  autoCapitalize="words"
                  value={lastName}
                  placeholder={t("last_name")}
                  placeholderTextColor={currentColors.tabIconDefault}
                  onChangeText={(name) => setLastName(name)}
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
                  autoCapitalize="none"
                  value={emailAddress}
                  placeholder={t("email_placeholder")}
                  placeholderTextColor={currentColors.tabIconDefault}
                  keyboardType="email-address"
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
                  onPress={onSignUpPress}
                  disabled={loading}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? t("loading") : t("sign_up_button")}
                  </Text>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: currentColors.border },
                    ]}
                  />
                  <Text style={styles.dividerText}>{t("or")}</Text>
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: currentColors.border },
                    ]}
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.googleButton,
                    {
                      backgroundColor: currentColors.googleButtonBG,
                      borderColor: currentColors.border,
                    },
                    pressed && {
                      opacity: 0.92,
                      borderColor: currentColors.tint,
                    },
                  ]}
                  onPress={onGoogleSignUp}
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
                  <Text style={styles.footerText}>
                    {t("already_have_account")}
                  </Text>
                  <TouchableOpacity onPress={() => router.push("/sign-in")}>
                    <Text
                      style={[styles.footerLink, { color: currentColors.text }]}
                    >
                      {t("sign_in_link")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.title, { color: currentColors.text }]}>
                  {t("verify_email")}
                </Text>
                <Text style={[styles.subtitle, { color: currentColors.tint }]}>
                  {t("enter_code", { email: emailAddress })}
                </Text>

                <TextInput
                  value={code}
                  placeholder={t("verification_code")}
                  placeholderTextColor={currentColors.tabIconDefault}
                  keyboardType="numeric"
                  onChangeText={(c) => setCode(c)}
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
                  onPress={onPressVerify}
                  disabled={loading}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? t("verifying") : t("verify_button")}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  innerContainer: { padding: 24, justifyContent: "center" },
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
    marginVertical: 24,
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
  googleButtonPressed: {},
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
