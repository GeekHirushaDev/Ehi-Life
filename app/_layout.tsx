import {
    ClerkLoaded,
    ClerkProvider,
    useAuth,
    useUser,
} from "@clerk/clerk-expo";
import {
    Stack,
    useRootNavigationState,
    useRouter,
    useSegments,
} from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ThemeConfigProvider } from "../context/ThemeConfig";
import "../i18n";
import { LANGUAGE_KEY } from "../i18n";
import { syncUserToFirestore } from "../utils/userSync";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env");
}

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch {
      return;
    }
  },
};

function RootLayoutNav() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  const [hasCheckedLanguage, setHasCheckedLanguage] = useState(false);
  const [languageIsSet, setLanguageIsSet] = useState(false);

  useEffect(() => {
    const checkLang = async () => {
      try {
        const stored = await SecureStore.getItemAsync(LANGUAGE_KEY);
        if (stored) {
          setLanguageIsSet(true);
        }
      } catch (err) {
        console.error("Failed to fetch language preference:", err);
      } finally {
        setHasCheckedLanguage(true);
      }
    };
    checkLang();
  }, []);

  useEffect(() => {
    if (!isLoaded || !hasCheckedLanguage || !rootNavigationState?.key) return;

    const routeByState = async () => {
      const inAuthGroup = segments[0] === "(auth)";
      const isLanguageScreen = segments[0] === "language";

      const storedLanguage = await SecureStore.getItemAsync(LANGUAGE_KEY);
      const hasLanguage = !!storedLanguage;

      if (hasLanguage !== languageIsSet) {
        setLanguageIsSet(hasLanguage);
      }

      if (!hasLanguage && !isLanguageScreen) {
        router.replace("/language");
        return;
      }

      if (hasLanguage) {
        if (isSignedIn && (inAuthGroup || isLanguageScreen)) {
          router.replace("/");
        } else if (!isSignedIn && !inAuthGroup) {
          router.replace("/sign-in");
        }
      }
    };

    routeByState();
  }, [
    isSignedIn,
    isLoaded,
    hasCheckedLanguage,
    languageIsSet,
    segments,
    rootNavigationState?.key,
  ]);

  useEffect(() => {
    if (isSignedIn && user && languageIsSet) {
      syncUserToFirestore(user);
    }
  }, [isSignedIn, user, languageIsSet]);

  if (!hasCheckedLanguage || !isLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <ThemeConfigProvider>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <RootLayoutNav />
        </ClerkLoaded>
      </ClerkProvider>
    </ThemeConfigProvider>
  );
}
