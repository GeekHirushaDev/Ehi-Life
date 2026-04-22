import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { LANGUAGE_KEY } from "../i18n";
import { getItem } from "./storage";

type PersistedOnboardingState = {
  state?: {
    language?: string;
    primaryGoals?: string[];
    eventFocus?: string[];
    experienceLevel?: string;
    readingPreferences?: {
      theme?: "system" | "light" | "dark";
      fontSize?: number;
    };
    reminders?: string[];
    onboardingCompleted?: boolean;
  };
};

const getPersistedOnboarding = async () => {
  try {
    const raw = await getItem("onboarding-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedOnboardingState;
    return parsed?.state ?? null;
  } catch {
    return null;
  }
};

export const syncUserToFirestore = async (user: any) => {
  if (!user) return;

  try {
    let languagePref = "en";
    const onboarding = await getPersistedOnboarding();
    const wizardCompleted = (await getItem("wizardCompleted")) === "true";

    try {
      const stored = await getItem(LANGUAGE_KEY);
      if (stored) {
        languagePref = stored;
      } else if (onboarding?.language) {
        languagePref = onboarding.language;
      }
    } catch {
      // ignore
    }

    const userRef = doc(db, "users", user.id);
    await setDoc(
      userRef,
      {
        id: user.id,
        clerkId: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email:
          user.primaryEmailAddress?.emailAddress ||
          user.emailAddresses?.[0]?.emailAddress ||
          "",
        photoUrl: user.imageUrl || "",
        languagePref,
        onboardingCompleted:
          wizardCompleted || onboarding?.onboardingCompleted === true,
        primaryGoals: onboarding?.primaryGoals ?? [],
        eventFocus: onboarding?.eventFocus ?? [],
        experienceLevel: onboarding?.experienceLevel ?? "",
        readingPreferences: onboarding?.readingPreferences ?? {
          theme: "system",
          fontSize: 16,
        },
        reminders: onboarding?.reminders ?? [],
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    console.log(
      "User synced to Firestore successfully. Preferred Lang:",
      languagePref,
    );
  } catch (error) {
    console.error("Error syncing user to Firestore:", error);
  }
};
