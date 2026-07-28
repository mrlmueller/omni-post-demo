import { NextRequest, NextResponse } from "next/server";
import OAuth from "oauth-1.0a";
import crypto from "crypto";
import axios from "axios";

export async function GET(request: NextRequest) {
  const parameter = request.nextUrl.searchParams;
  const userId = parameter.get("state");

  const scopes = ["tweet.read", "users.read", "offline.access", "tweet.write"];

  const scopeString = scopes.join("%20");

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

  const requestTokenUrl = "https://api.twitter.com/oauth/request_token";

  const requestData = {
    url: requestTokenUrl,
    method: "POST",
    data: {
      oauth_callback: `${process.env.BASE_URL}${
        process.env.TWITTER_CALLBACK_URL
      }?state=${encodeURIComponent(userId as string)}`,
    },
  };

  const authHeader = oauth.toHeader(oauth.authorize(requestData));

  try {
    const response = await axios({
      method: requestData.method,
      url: requestData.url,
      headers: {
        Authorization: authHeader.Authorization,
      },
    });

    const queryParams = new URLSearchParams(response.data);
    const oauthToken = queryParams.get("oauth_token");
    const oauthTokenSecret = queryParams.get("oauth_token_secret");
    const oauthCallbackConfirmed = queryParams.get("oauth_callback_confirmed");

    if (oauthCallbackConfirmed !== "true") {
      throw new Error("Callback not confirmed");
    }

    return NextResponse.json(
      {
        redirectUrl: `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}&force_login=true&scope=${scopeString}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error obtaining request token:", error);
    console.error(
      "Error details:",
      error.response ? error.response.data : error.message
    );

    return NextResponse.json(
      {
        error: "Failed to obtain request token",
        message: error.message,
        details: error.response ? error.response.data : null,
      },
      { status: error.response ? error.response.status : 500 }
    );
  }
}
