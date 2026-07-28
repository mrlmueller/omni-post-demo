import { setOAuthStatusCookie } from "@/app/api/utils/cookieUtil";
import { encryptToken } from "@/app/lib/encryption";
import * as admin from "firebase-admin";
import { google } from "googleapis";
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

// Initialize the Firebase Admin SDK
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
  const parameter = request.nextUrl.searchParams;
  const code = parameter.get("code");
  const userId = parameter.get("state");

  if (!code || !userId) {
    return setOAuthStatusCookie(
      "error",
      "You are no logged in or the code is missing. Try again.",
      500
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BASE_URL}${process.env.YOUTUBE_REDIRECT_URI}`
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens) {
      return setOAuthStatusCookie(
        "error",
        "Failed to get tokens from YouTube. Try again.",
        500
      );
    }

    const requiredScopes = [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.readonly",
    ];

    const grantedScopesString = tokens.scope ?? "";
    const grantedScopes = grantedScopesString
      .split(" ")
      .map((scope) => scope.trim());

    const missingScopes = requiredScopes.filter(
      (scope) => !grantedScopes.includes(scope)
    );

    const formattedMissingScopes = missingScopes.map((scope) =>
      scope.split("/").pop()
    );

    if (formattedMissingScopes.length > 0) {
      return setOAuthStatusCookie(
        "error",
        `Missing required scopes: ${formattedMissingScopes.join(", ")}`,
        403
      );
    }

    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    const responseYoutube = await youtube.channels.list({
      part: ["snippet", "contentDetails", "statistics"],
      mine: true,
    });

    const channelInfo = responseYoutube.data.items
      ? responseYoutube.data.items[0]
      : null;

    if (!channelInfo) {
      return setOAuthStatusCookie(
        "error",
        "Failed to get data from YouTube. Try again.",
        500
      );
    }

    // Define the data to save in Firestore
    const youtubeAccountData = {
      tokenId: tokens.id_token!,
      scope: tokens.scope!,
      access_token: encryptToken(tokens.access_token!),
      refresh_token: encryptToken(tokens.refresh_token!),
      channelType: channelInfo.kind!,
      channelId: channelInfo.id!,
      username: channelInfo.snippet!.title!,
      channelImage: channelInfo.snippet!.thumbnails!.high!.url!,
      loggedInAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const userRef = firestore.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.socials?.youtube?.channelId === channelInfo.id) {
        return setOAuthStatusCookie("error", "Account already linked", 403);
      } else if (userData?.socials?.youtube) {
        return setOAuthStatusCookie(
          "error",
          "Account already linked to another user",
          403
        );
      }
    }

    // New check: Query to see if channelId is linked to another user
    const youtubeIdQuery = firestore
      .collection("users")
      .where("socials.youtube.channelId", "==", channelInfo.id);
    const querySnapshot = await youtubeIdQuery.get();

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
          youtube: youtubeAccountData,
        },
      },
      { merge: true }
    );

    // Make sure that the content is revalidated so the user gets up to date data
    revalidateTag("profile_update");

    return setOAuthStatusCookie("success", "Account linked successfully", 200);
  } catch (error) {
    console.error("Error processing request:", error);
    return setOAuthStatusCookie("error", "Failed to link account", 500);
  }
}
