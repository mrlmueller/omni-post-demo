// app/lib/admin/firebaseAdmin.ts
import * as admin from "firebase-admin";

const {
  NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
} = process.env;

// Initialize Firebase Admin if not already initialized
const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    if (
      !NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      !FIREBASE_CLIENT_EMAIL ||
      !FIREBASE_PRIVATE_KEY
    ) {
      throw new Error("Missing Firebase configuration in environment variables");
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines with actual newlines in the private key
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }
  
  return admin;
};

// Helper function to get Firebase Admin with initialized Firestore
export const getFirebaseAdmin = () => {
  const adminInstance = initializeFirebaseAdmin();
  return {
    admin: adminInstance,
    firestore: adminInstance.firestore(),
    auth: adminInstance.auth(),
  };
};

// For backwards compatibility
export { admin };
