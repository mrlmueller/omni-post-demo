import { setOAuthStatusCookie } from "@/app/api/utils/cookieUtil";
import { encryptToken } from "@/app/lib/encryption";
import axios from "axios";
import crypto from "crypto";
import * as admin from "firebase-admin";
import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";
import OAuth from "oauth-1.0a";

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
  async function fetchTwitterUserProfile(
    accessToken: string,
    tokenSecret: string
  ) {
    const oauth = new OAuth({
      consumer: {
        key: process.env.CONSUMER_KEY!,
        secret: process.env.CONSUMER_SECRET!,
      },
      signature_method: "HMAC-SHA1",
      hash_function(base_string, key) {
        return crypto
          .createHmac("sha1", key)
          .update(base_string)
          .digest("base64");
      },
    });

    const url = "https://api.twitter.com/1.1/account/verify_credentials.json";
    const requestData = {
      url: url,
      method: "GET",
      // Include additional parameters here if necessary, such as `include_email: true` if you have the requisite permissions
    };

    const authHeader = oauth.toHeader(
      oauth.authorize(requestData, { key: accessToken, secret: tokenSecret })
    );

    try {
      const response = await axios({
        method: requestData.method,
        url: requestData.url,
        headers: {
          Authorization: authHeader.Authorization,
          "Content-Type": "application/json",
        },
      });

      return response.data; // This contains the user profile information
    } catch (error) {
      console.error("Failed to fetch Twitter user profile:", error);
      throw new Error("Failed to fetch Twitter user profile");
    }
  }

  const parameter = request.nextUrl.searchParams;
  const userId = parameter.get("state");
  const oauth_token = parameter.get("oauth_token");
  const oauth_verifier = parameter.get("oauth_verifier");

  if (!oauth_token || !oauth_verifier) {
    return setOAuthStatusCookie("error", "Missing required parameters", 400);
  }

  const oauth = new OAuth({
    consumer: {
      key: process.env.CONSUMER_KEY!,
      secret: process.env.CONSUMER_SECRET!,
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
      return crypto
        .createHmac("sha1", key)
        .update(base_string)
        .digest("base64");
    },
  });

  const accessTokenUrl = "https://api.twitter.com/oauth/access_token";

  const requestData = {
    url: accessTokenUrl,
    method: "POST",
    data: {
      oauth_token: oauth_token,
      oauth_verifier: oauth_verifier,
    },
  };

  const authHeader = oauth.toHeader(oauth.authorize(requestData));

  try {
    const responseTwitter = await axios({
      method: requestData.method,
      url: requestData.url,
      headers: {
        Authorization: authHeader.Authorization,
      },
      params: {
        oauth_verifier,
      },
    });

    // Parse the response
    const queryParams = new URLSearchParams(responseTwitter.data);
    const accessToken = queryParams.get("oauth_token");
    const tokenSecret = queryParams.get("oauth_token_secret");
    const userProfile = await fetchTwitterUserProfile(
      accessToken!,
      tokenSecret!
    );

    // Check if the account is already linked to another user
    const userRef = firestore.collection("users").doc(userId!);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.socials?.twitter?.twitterIdStr === userProfile.id_str) {
        return setOAuthStatusCookie(
          "error",
          "Account already linked to another user",
          403
        );
      } else if (userData?.socials?.twitter) {
        return setOAuthStatusCookie(
          "error",
          "Account already linked to another user",
          500
        );
      }
    }

    // New check: Query to see if twitterIdStr is linked to another user

    const twitterIdQuery = firestore
      .collection("users")
      .where("socials.twitter.twitterIdStr", "==", userProfile.id_str);
    const querySnapshot = await twitterIdQuery.get();

    if (!querySnapshot.empty) {
      return setOAuthStatusCookie(
        "error",
        "Account already linked to another user",
        500
      );
    }

    // Define the data to save in Firestore
    const twitterAccountData = {
      twitterId: userProfile.id.toString(),
      twitterIdStr: userProfile.id_str,
      username: userProfile.screen_name,
      oauthToken: accessToken!,
      oauthTokenSecret: encryptToken(tokenSecret!),
      channelImage: userProfile.profile_image_url_https,
      loggedInAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await userRef.set(
      {
        socials: {
          twitter: twitterAccountData,
        },
      },
      { merge: true }
    );

    // Make sure that the content is revalidated so the user gets up to date data
    revalidateTag("profile_update");

    return setOAuthStatusCookie("success", "Account linked successfully", 200);
  } catch (error: any) {
    console.error("Error obtaining access token:", error);
    console.error(
      "Error details:",
      error.response ? error.response.data : error.message
    );
    return setOAuthStatusCookie("error", "Failed to link account", 500);
  }
}
