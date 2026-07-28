import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Function to generate a code verifier
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("hex");
}

// Function to generate a code challenge from a code verifier
function generateCodeChallenge(codeVerifier: string) {
  return crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const parameter = request.nextUrl.searchParams;
  const userId = parameter.get("state");
  try {
    const client_key = process.env.TIKTOK_CLIENT_KEY!;

    const redirect_uri = ((process.env.BASE_URL as string) +
      process.env.TIKTOK_REDIRECT_URI) as string;

    const scope = "user.info.basic,video.publish,video.upload";
    const response_type = "code";

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    const queryParams = new URLSearchParams({
      client_key,
      scope,
      response_type,
      redirect_uri,
      state: userId as string,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    }).toString();

    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${queryParams}`;
    return NextResponse.json({ redirectUrl: authUrl }, { status: 200 });
  } catch (error: any) {
    console.error("Error obtaining auth URL:", error.message);
    return NextResponse.json(
      {
        error: "Failed to obtain auth URL",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
