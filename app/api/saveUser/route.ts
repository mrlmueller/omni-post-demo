import { firestore } from "@/app/lib/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { uid, displayName, email, photoURL, providerId } = body;

  try {
    const userRef = doc(firestore, `users/${uid}`);
    await setDoc(
      userRef,
      {
        uid,
        displayName,
        email,
        photoURL,
        providerId,
        lastLogin: new Date(),
      },
      { merge: true }
    );
    console.log("Document set in Firestore successfully.");

    return NextResponse.json(
      { message: "User saved successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error saving user to Firestore", error.message, error.code);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
