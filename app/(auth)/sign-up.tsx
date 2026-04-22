import { useOAuth, useSignUp } from "@clerk/clerk-expo";
import { AntDesign } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
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

WebBrowser.maybeCompleteAuthSession();

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

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
        router.replace("/");
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
        router.replace("/");
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.innerContainer}>
            {!pendingVerification ? (
              <>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>
                  Begin your Ehi Life experience
                </Text>

                <TextInput
                  autoCapitalize="words"
                  value={firstName}
                  placeholder="First Name"
                  placeholderTextColor="#A0A0A0"
                  onChangeText={(name) => setFirstName(name)}
                  style={styles.input}
                />
                <TextInput
                  autoCapitalize="words"
                  value={lastName}
                  placeholder="Last Name"
                  placeholderTextColor="#A0A0A0"
                  onChangeText={(name) => setLastName(name)}
                  style={styles.input}
                />
                <TextInput
                  autoCapitalize="none"
                  value={emailAddress}
                  placeholder="Email Address"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  onChangeText={(email) => setEmailAddress(email)}
                  style={styles.input}
                />
                <TextInput
                  value={password}
                  placeholder="Password"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={true}
                  onChangeText={(password) => setPassword(password)}
                  style={styles.input}
                />

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={onSignUpPress}
                  disabled={loading}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? "Loading..." : "Sign Up"}
                  </Text>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.divider} />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.googleButton,
                    pressed && styles.googleButtonPressed,
                  ]}
                  onPress={onGoogleSignUp}
                  android_ripple={{ color: "#F1F1F1" }}
                >
                  <View style={styles.googleIconBadge}>
                    <AntDesign name="google" size={16} color="#DB4437" />
                  </View>
                  <Text style={styles.googleButtonText}>
                    Continue with Google
                  </Text>
                </Pressable>

                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity onPress={() => router.push("/sign-in")}>
                    <Text style={styles.footerLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.title}>Verify Email</Text>
                <Text style={styles.subtitle}>
                  Enter the code sent to {emailAddress}
                </Text>

                <TextInput
                  value={code}
                  placeholder="Verification Code"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="numeric"
                  onChangeText={(c) => setCode(c)}
                  style={styles.input}
                />

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={onPressVerify}
                  disabled={loading}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? "Verifying..." : "Verify Code"}
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
  container: { flex: 1, backgroundColor: "#F5F7F5" },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  innerContainer: { padding: 24, justifyContent: "center" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C4C3B",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#4A7C59",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#4A7C59",
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
  divider: { flex: 1, height: 1, backgroundColor: "#E0E0E0" },
  dividerText: { marginHorizontal: 16, color: "#A0A0A0", fontSize: 14 },
  googleButton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  googleButtonPressed: {
    opacity: 0.92,
    borderColor: "#D0D0D0",
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
  googleButtonText: { color: "#2C4C3B", fontSize: 16, fontWeight: "600" },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: { color: "#4A7C59", fontSize: 15 },
  footerLink: { color: "#2C4C3B", fontSize: 15, fontWeight: "bold" },
});
