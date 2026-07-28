import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const parameter = request.nextUrl.searchParams;
  const userId = parameter.get("state");

  try {
    const client_id = process.env.GOOGLE_CLIENT_ID!;
    const redirect_uri = ((process.env.BASE_URL as string) +
      process.env.YOUTUBE_REDIRECT_URI) as string;

    console.log("Redirect URI: ", redirect_uri);
    const scope =
      "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/youtube.upload";
    const response_type = "code";
    const access_type = "offline";
    const prompt = "consent";
    const state = userId as string;

    const queryParams = new URLSearchParams({
      client_id,
      redirect_uri,
      scope,
      response_type,
      access_type,
      prompt,
      state,
    }).toString();

    const authUrl = `https://accounts.google.com/o/oauth2/auth/oauthchooseaccount?${queryParams}`;

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
