import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const {
    uid,
    displayName,
    email,
    photoURL,
    providerId,
    token,
    acceptedTerms,
  } = body;

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  try {
    const response = await axios.post(
      "https://europe-west3-omni-post-eu.cloudfunctions.net/save-user-to-database",
      {
        uid,
        displayName,
        email,
        photoURL,
        providerId,
        token,
        secret: process.env.CLOUD_FUNCTION_SECRET,
        acceptedTerms,
      }
    );
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error(
      "Error saving user data:",
      error.response ? error.response.data : error.message
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
