import * as admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const firestore = admin.firestore();

export const getServerPremiumStatus = async (
  userId: string
): Promise<boolean> => {
  try {
    // Access the Firestore collection for the user's subscriptions
    const subscriptionsRef = firestore
      .collection("users")
      .doc(userId)
      .collection("subscriptions");

    // Query for active or trialing subscriptions
    const activeSubscriptions = await subscriptionsRef
      .where("status", "in", ["trialing", "active"])
      .get();

    // If there are active subscriptions, the user is premium
    return !activeSubscriptions.empty;
  } catch (error) {
    console.error("Error fetching premium status from server:", error);
    throw new Error("Failed to check premium status");
  }
};
