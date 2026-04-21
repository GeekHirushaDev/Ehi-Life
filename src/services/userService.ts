import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserProfileParams {
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  photoUrl?: string;
}

/**
 * Creates or updates a user profile in Firestore
 * @param clerkUserId The user's ID from Clerk Auth
 * @param params Basic user information to save
 */
export const createUserProfile = async (clerkUserId: string, params: UserProfileParams) => {
  if (!clerkUserId) {
    console.error("No valid clerkUserId provided");
    return;
  }

  try {
    const userRef = doc(db, 'users', clerkUserId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // User doesn't exist, create profile
      await setDoc(userRef, {
        clerkId: clerkUserId,
        email: params.email,
        firstName: params.firstName || '',
        lastName: params.lastName || '',
        displayName: params.displayName || '',
        photoUrl: params.photoUrl || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        onboarded: false, 
      });
      console.log("User profile created in Firestore");
    } else {
      console.log("User profile already exists");
      // Handle updates if needed
    }
  } catch (error) {
    console.error("Error creating user profile in Firestore:", error);
  }
};
