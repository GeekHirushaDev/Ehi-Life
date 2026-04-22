import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const syncUserToFirestore = async (user: any) => {
  if (!user) return;

  try {
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
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    console.log("User synced to Firestore successfully.");
  } catch (error) {
    console.error("Error syncing user to Firestore:", error);
  }
};
