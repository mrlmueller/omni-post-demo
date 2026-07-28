import { setOAuthStatusCookie } from "@/app/api/utils/cookieUtil";
import { encryptToken } from "@/app/lib/encryption";
import axios from "axios";
import * as admin from "firebase-admin";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import qs from "qs";

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

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const error = params.get("error");
  const errorDescription = params.get("error_description");

  if (error) {
    console.error(`Error: ${error}`);
    console.error(`Error description: ${errorDescription}`);
    return NextResponse.json(
      {
        error: `Authorization failed: ${error}`,
        description: errorDescription,
      },
      { status: 400 }
    );
  }

  if (!code) {
    return setOAuthStatusCookie("error", "Missing code parameter", 403);
  }

  try {
    const client_key = process.env.TIKTOK_CLIENT_KEY!;
    const client_secret = process.env.TIKTOK_CLIENT_SECRET!;
    const redirect_uri = ((process.env.BASE_URL as string) +
      process.env.TIKTOK_REDIRECT_URI) as string;
    const grant_type = "authorization_code";

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      "https://open.tiktokapis.com/v2/oauth/token/",
      qs.stringify({
        client_key,
        client_secret,
        code,
        grant_type,
        redirect_uri,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const tokenData = tokenResponse.data;

    if (!tokenData.access_token) {
      return setOAuthStatusCookie("error", "Access token is missing", 403);
    }

    const access_token = tokenData.access_token;

    const requiredScopes = ["user.info.basic", "video.publish", "video.upload"];
    const grantedScopes = tokenData.scope.split(",");

    // Check if all required scopes are granted
    const missingScopes = requiredScopes.filter(
      (scope) => !grantedScopes.includes(scope)
    );

    if (missingScopes.length > 0) {
      return setOAuthStatusCookie(
        "error",
        `Missing required scopes: ${missingScopes.join(", ")}`,
        403
      );
    }

    // Fetch user info
    const userInfoResponse = await axios.get(
      "https://open.tiktokapis.com/v2/user/info/",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        params: {
          fields: "open_id,avatar_url,display_name",
        },
      }
    );

    const userInfoData = userInfoResponse.data;

    const tiktokAccountData = {
      access_token: encryptToken(tokenData.access_token),
      refresh_token: encryptToken(tokenData.refresh_token),
      scope: tokenData.scope,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      refresh_expires_in: tokenData.refresh_expires_in,
      open_id: userInfoData.data.user.open_id,
      channelImage: userInfoData.data.user.avatar_url,
      username: userInfoData.data.user.display_name,
      loggedInAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const userId = state; // Assuming `state` parameter contains user ID
    const userRef = firestore.collection("users").doc(userId!);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      if (
        userData?.socials?.tiktok?.open_id === userInfoData.data.user.open_id
      ) {
        return setOAuthStatusCookie("error", "Account already linked", 403);
      } else if (userData?.socials?.tiktok) {
        return setOAuthStatusCookie(
          "error",
          "Account already linked to another user",
          500
        );
      }
    }

    // New check: Query to see if open_id is linked to another user
    const tiktokIdQuery = firestore
      .collection("users")
      .where("socials.tiktok.open_id", "==", userInfoData.data.user.open_id);
    const querySnapshot = await tiktokIdQuery.get();

    if (!querySnapshot.empty) {
      return setOAuthStatusCookie(
        "error",
        "Account already linked to another user",
        500
      );
    }

    await userRef.set(
      {
        socials: {
          tiktok: tiktokAccountData,
        },
      },
      { merge: true }
    );

    revalidateTag("profile_update");

    return setOAuthStatusCookie("success", "Account linked successfully", 200);
  } catch (error: any) {
    console.error(
      "Error exchanging code for tokens or fetching user info:",
      error.message
    );
    return setOAuthStatusCookie("error", "Failed to link account", 500);
  }
}
