import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const { token, social } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  if (!social) {
    return NextResponse.json(
      { error: "Social platform is required" },
      { status: 400 }
    );
  }

  let normalizedSocial = social.toLowerCase();

  // Change 'google' to 'youtube', 'facebook' to 'instagram', and 'x' to 'twitter'
  if (normalizedSocial === "google") {
    normalizedSocial = "youtube";
  } else if (normalizedSocial === "facebook") {
    normalizedSocial = "instagram";
  } else if (normalizedSocial === "x") {
    normalizedSocial = "twitter";
  }

  const validSocialPlatforms = ["twitter", "instagram", "youtube", "tiktok"];
  if (!validSocialPlatforms.includes(normalizedSocial)) {
    return NextResponse.json(
      { error: "Invalid social platform" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.post(
      "https://europe-west3-omni-post-eu.cloudfunctions.net/delete-user-social",
      {
        token,
        social_name: normalizedSocial,
        secret: process.env.CLOUD_FUNCTION_SECRET,
      }
    );
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}
