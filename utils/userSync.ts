import * as SecureStore from "expo-secure-store";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { LANGUAGE_KEY } from "../i18n";

export const syncUserToFirestore = async (user: any) => {
  if (!user) return;

  try {
    let languagePref = "en";
    try {
      const stored = await SecureStore.getItemAsync(LANGUAGE_KEY);
      if (stored) languagePref = stored;
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
