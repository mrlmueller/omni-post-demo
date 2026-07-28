import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const parameter = request.nextUrl.searchParams;
  const userId = parameter.get("state");

  // Retrieve environment variable for client ID
  const clientId = process.env.FACEBOOK_APP_ID;
  if (!clientId) {
    console.error("Facebook App ID not found in environment variables");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const scopes = [
    "instagram_basic",
    "instagram_content_publish",
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
    "public_profile",
  ];

  const redirectUri = encodeURIComponent(
    ((process.env.BASE_URL as string) +
      process.env.FACEBOOK_REDIRECT_URI) as string
  );
  const state = encodeURIComponent(userId as string);
  const scope = encodeURIComponent(scopes.join(","));

  // Construct the authorization URL
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&response_type=code&scope=${scope}`;

  try {
    return NextResponse.json({ redirectUrl: url }, { status: 200 });
  } catch (error: any) {
    console.error("Error constructing the login URL:", error.message);
    return NextResponse.json(
      {
        error: "Failed to construct the login URL",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
