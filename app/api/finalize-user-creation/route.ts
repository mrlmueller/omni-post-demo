// pages/api/finalize-user-creation.js

import * as admin from "firebase-admin";
import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Authorization header missing or improperly formatted.");
      return NextResponse.json(
        { error: "Authorization token is missing or invalid" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;

    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (error: any) {
      console.error("Token verification failed:", error.message);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const uid = decodedToken.uid;

    // Set providerId from token or default to Google if it’s undefined
    const providerId = decodedToken.firebase?.sign_in_provider || "google.com";

    const requestBody = await request.json();
    const { acceptedTerms } = requestBody;

    // Check that acceptedTerms is true
    if (!acceptedTerms) {
      console.error("User did not accept legal terms.");
      return NextResponse.json(
        { error: "User must accept the legal terms before saving" },
        { status: 400 }
      );
    }

    // Ensure all required fields are present
    if (!uid) {
      console.error("Missing required user information:", {
        uid,
        displayName: decodedToken.name,
        email: decodedToken.email,
        photoURL: decodedToken.picture,
        providerId,
      });
      return NextResponse.json(
        { error: "Missing required user information" },
        { status: 400 }
      );
    }

    // Save the user data to Firestore
    await firestore.collection("users").doc(uid).set({
      uid,
      displayName: decodedToken.name,
      email: decodedToken.email,
      photoURL: decodedToken.picture,
      providerId,
      acceptedTerms,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error finalizing user creation:", error.message);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
