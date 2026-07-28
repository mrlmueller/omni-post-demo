import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const body = await req.json();

  let token, refreshToken;

  // Check if token is directly in the request
  if (body.token) {
    token = body.token;
  } else if (
    body.user &&
    body.user.stsTokenManager &&
    body.user.stsTokenManager.accessToken &&
    body.user.stsTokenManager.refreshToken
  ) {
    // Check if token is within a user object
    token = body.user.stsTokenManager.accessToken;
    refreshToken = body.user.stsTokenManager.refreshToken;
  }

  if (token) {
    cookieStore.set("token", token);
    if (refreshToken) {
      cookieStore.set("refreshToken", refreshToken);
    }
    revalidateTag("profile_update");
    return NextResponse.json({ message: "Cookies set" });
  } else {
    return NextResponse.json({ error: "Token not provided" }, { status: 400 });
  }
}
