import { setOAuthStatusCookie } from "@/app/api/utils/cookieUtil";
import { encryptToken } from "@/app/lib/encryption";
import axios from "axios";
import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";
import { getFirebaseAdmin } from "@/app/lib/admin/firebaseAdmin";

const { admin, firestore } = getFirebaseAdmin();

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");

  if (!code) {
    return await setOAuthStatusCookie("error", "Authorization code is missing", 400);
  }

  const clientId = process.env.FACEBOOK_APP_ID;
  const clientSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = ((process.env.BASE_URL as string) +
    process.env.FACEBOOK_REDIRECT_URI) as string;

  try {
    const tokenResponse = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          client_id: clientId,
          redirect_uri: redirectUri,
          client_secret: clientSecret,
          code: code,
        },
      }
    );
    const accessToken = tokenResponse.data.access_token;

    const debugUrl = "https://graph.facebook.com/debug_token";
    const debugResponse = await axios.get(debugUrl, {
      params: {
        input_token: accessToken,
        access_token: `${clientId}|${clientSecret}`,
      },
    });

    if (!debugResponse.data.data.is_valid) {
      throw new Error("The access token is invalid.");
    }
    if (debugResponse.data.data.app_id !== clientId) {
      return await setOAuthStatusCookie(
        "error",
        "Access token does not match the client ID",
        500
      );
    }

    const requiredScopes = [
      "instagram_basic",
      "instagram_content_publish",
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
      "public_profile",
    ];

    // Extract granted scopes, ensuring it's an array of strings
    let grantedScopes = debugResponse.data.data.scopes;
    if (typeof grantedScopes === "string") {
      grantedScopes = grantedScopes.split(",").map((scope) => scope.trim());
    }

    // Check for missing scopes
    const missingScopes = requiredScopes.filter(
      (scope) => !grantedScopes.includes(scope)
    );

    if (missingScopes.length > 0) {
      return await setOAuthStatusCookie(
        "error",
        `Missing required scopes: ${missingScopes.join(", ")}`,
        403
      );
    }

    let instagramAccountData = {};
    let instagramId = null;

    const removeUndefined = (obj: any) => {
      return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined)
      );
    };

    // Check if Instagram account linking is required
    const instagramScope = grantedScopes.includes("instagram_basic");
    if (instagramScope) {
      const instagramTargetIds = debugResponse.data.data.granular_scopes.find(
        (scope: any) => scope.scope === "instagram_basic"
      )?.target_ids;

      if (instagramTargetIds && instagramTargetIds.length > 1) {
        return await setOAuthStatusCookie(
          "error",
          "Only one Instagram account can be linked",
          403
        );
      }

      if (instagramTargetIds && instagramTargetIds.length === 1) {
        instagramId = instagramTargetIds[0];

        const instagramDetailsUrl = `https://graph.facebook.com/v19.0/${instagramId}`;
        const instagramDetailsResponse = await axios.get(instagramDetailsUrl, {
          params: {
            fields:
              "id,username,biography,followers_count,follows_count,media_count,profile_picture_url,website",
            access_token: accessToken,
          },
        });

        instagramAccountData = {
          instagramId: instagramId,
          username: instagramDetailsResponse.data.username,
          channelImage: instagramDetailsResponse.data.profile_picture_url,
          followersCount: instagramDetailsResponse.data.followers_count,
          followsCount: instagramDetailsResponse.data.follows_count,
          mediaCount: instagramDetailsResponse.data.media_count,
          website: instagramDetailsResponse.data.website,
        };
      }
    }

    let facebookPageId = null;
    let facebookPageName = null;

    const facebookTargetIds = debugResponse.data.data.granular_scopes.find(
      (scope: any) => scope.scope === "pages_manage_posts"
    )?.target_ids;

    if (facebookTargetIds && facebookTargetIds.length > 1) {
      return await setOAuthStatusCookie(
        "error",
        "Bitte wähle nur eine Facebook-Seite aus",
        403
      );
    }

    if (facebookTargetIds && facebookTargetIds.length === 1) {
      facebookPageId = facebookTargetIds[0];

      const pageAccessTokenResponse = await axios.get(
        `https://graph.facebook.com/v21.0/${facebookPageId}`,
        {
          params: {
            access_token: accessToken,
            fields: "access_token",
          },
        }
      );

      const pageAccessToken = pageAccessTokenResponse.data.access_token;

      const pageDetailsResponse = await axios.get(
        `https://graph.facebook.com/v21.0/${facebookPageId}`,
        {
          params: {
            access_token: pageAccessToken,
            fields: "name",
          },
        }
      );

      facebookPageName = pageDetailsResponse.data.name;
    }

    const userRef = firestore.collection("users").doc(state!);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.socials?.instagram?.instagramId === instagramId) {
        return await setOAuthStatusCookie("error", "Account already linked", 403);
      } else if (userData?.socials?.instagram) {
        return await setOAuthStatusCookie(
          "error",
          "Account already linked to another user",
          500
        );
      }
    }

    const instagramIdQuery = firestore
      .collection("users")
      .where("socials.instagram.instagramId", "==", instagramId);
    const querySnapshot = await instagramIdQuery.get();

    if (!querySnapshot.empty) {
      return await setOAuthStatusCookie(
        "error",
        "Account already linked to another user",
        403
      );
    }

    instagramAccountData = removeUndefined(instagramAccountData);

    const socialData = removeUndefined({
      facebookPageId,
      facebookPageName,
      accessToken: encryptToken(accessToken),
      loggedInAt: admin.firestore.FieldValue.serverTimestamp(),
      ...instagramAccountData,
    });

    console.log("Social data:", socialData);

    await userRef.set(
      {
        socials: {
          instagram: instagramScope ? socialData : {},
        },
      },
      { merge: true }
    );

    revalidatePath('/user-profile');
    
    return await setOAuthStatusCookie("success", "Account linked successfully", 200);
  } catch (error: any) {
    console.error("Error processing the Facebook login:", error.message, {
      errorDetails: error?.response?.data || error,
    });
    return await setOAuthStatusCookie("error", "Failed to link account", 500);
  }
}
