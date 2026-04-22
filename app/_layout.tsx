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
import { useEffect, useState } from "react";
import { ThemeConfigProvider } from "../context/ThemeConfig";
import "../i18n";
import { deleteItem, getItem, setItem } from "../utils/storage";
import { syncUserToFirestore } from "../utils/userSync";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env");
}

const tokenCache = {
  async getToken(key: string) {
    try {
      return await getItem(key);
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await deleteItem(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return setItem(key, value);
    } catch {
      return;
    }
  },
};

import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

// ... existing code ...

function RootLayoutNav() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  const [hasCheckedWizard, setHasCheckedWizard] = useState(false);
  const [wizardCompleted, setWizardCompleted] = useState(false);

  useEffect(() => {
    const checkWizardState = async () => {
      try {
        const localWizardDone = (await getItem("wizardCompleted")) === "true";

        let cloudWizardDone = false;

        if (isLoaded && isSignedIn && user?.id) {
          try {
            const userRef = doc(db, "users", user.id);
            const userDoc = await getDoc(userRef);
            cloudWizardDone =
              userDoc.exists() && userDoc.data()?.onboardingCompleted === true;
          } catch (cloudErr: any) {
            if (cloudErr?.code !== "permission-denied") {
              console.error(
                "Failed to check cloud wizard preference:",
                cloudErr,
              );
            }
          }
        }

        setWizardCompleted(localWizardDone || cloudWizardDone);
      } catch (err) {
        console.error("Failed to fetch wizard preference:", err);
      } finally {
        setHasCheckedWizard(true);
      }
    };

    checkWizardState();
  }, [isLoaded, isSignedIn, user?.id]);

  useEffect(() => {
    if (!hasCheckedWizard || !rootNavigationState?.key) return;

    let cancelled = false;

    const routeByState = async () => {
      const inAuthGroup = segments[0] === "(auth)";
      const isWizardRoute = segments[0] === "wizard";
      const latestLocalWizardDone =
        (await getItem("wizardCompleted")) === "true";
      const effectiveWizardCompleted = wizardCompleted || latestLocalWizardDone;

      if (!isLoaded) {
        if (!effectiveWizardCompleted && !isWizardRoute) {
          router.replace("/wizard");
          return;
        }

        if (effectiveWizardCompleted && !inAuthGroup && !isWizardRoute) {
          router.replace("/sign-in");
        }
        return;
      }

      if (!cancelled && effectiveWizardCompleted !== wizardCompleted) {
        setWizardCompleted(effectiveWizardCompleted);
      }

      if (!isSignedIn && !effectiveWizardCompleted && !isWizardRoute) {
        router.replace("/wizard");
        return;
      }

      if (!isSignedIn && effectiveWizardCompleted && !inAuthGroup) {
        router.replace("/sign-in");
        return;
      }

      if (isSignedIn && !effectiveWizardCompleted && !isWizardRoute) {
        router.replace("/wizard");
        return;
      }

      if (
        isSignedIn &&
        effectiveWizardCompleted &&
        (inAuthGroup ||
          isWizardRoute ||
          !segments[0] ||
          segments[0] === "index")
      ) {
        router.replace("/(tabs)");
      }
    };

    routeByState();

    return () => {
      cancelled = true;
    };
  }, [
    isSignedIn,
    isLoaded,
    user?.id,
    hasCheckedWizard,
    wizardCompleted,
    segments,
    rootNavigationState?.key,
  ]);

  useEffect(() => {
    if (isSignedIn && user) {
      syncUserToFirestore(user);
    }
  }, [isSignedIn, user]);

  if (!hasCheckedWizard) {
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
