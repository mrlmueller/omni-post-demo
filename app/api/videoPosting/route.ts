import { getGCPCredentials } from "@/app/lib/gcpCredentials";
import { getUser } from "@/app/lib/getUser";
import { getServerPremiumStatus } from "@/stripe/getServerPremiumStatus";
import { PubSub } from "@google-cloud/pubsub";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const stateSchema = z.object({
  videoUrl: z.string().min(1, "Video url is required"),
  videoTitle: z.string().min(1, "Video title is required"),
  attributes: z.object({
    youtube: z.string(),
    instagram: z.string(),
    twitter: z.string(),
    tiktok: z.string(),
    facebook: z.string(),
  }),
  tiktokComplianceData: z.object({
    privacyLevelOption: z.string(),
    commentDisabled: z.boolean(),
    duetDisabled: z.boolean(),
    stitchDisabled: z.boolean(),
    discloseVideoContent: z.boolean(),
    isYourBrandChecked: z.boolean(),
    isBrandedContentChecked: z.boolean(),
  }),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validation = stateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  const user = await getUser();

  if (!user?.uid) {
    return NextResponse.json(
      { status: "error", message: "User not found | no valid session" },
      { status: 404 }
    );
  }

  try {
    const isPremium = await getServerPremiumStatus(user.uid);
    if (!isPremium) {
      return NextResponse.json(
        { status: "error", message: "Access denied: User is not premium" },
        { status: 403 }
      );
    }
  } catch (error: any) {
    console.error("Error checking premium status:", error.message);
    return NextResponse.json(
      { status: "error", message: "Failed to check premium status" },
      { status: 500 }
    );
  }

  const uploadId = new Date().toISOString();

  try {
    const gcpConfig = getGCPCredentials();
    const pubSubClient = new PubSub(gcpConfig);

    const messageData = {
      user_id: user.uid,
      video_url: validation.data.videoUrl,
      title: validation.data.videoTitle,
      upload_id: uploadId,
      tiktokCompliance: validation.data.tiktokComplianceData,
      attributes: {
        youtube: validation.data.attributes.youtube,
        instagram: validation.data.attributes.instagram,
        twitter: validation.data.attributes.twitter,
        tiktok: validation.data.attributes.tiktok,
        facebook: validation.data.attributes.facebook,
      },
    };

    const payload = {
      secret: process.env.CLOUD_FUNCTION_SECRET,
      user_id: user.uid,
      upload_id: uploadId,
      attributes: {
        youtube: validation.data.attributes.youtube,
        instagram: validation.data.attributes.instagram,
        twitter: validation.data.attributes.twitter,
        tiktok: validation.data.attributes.tiktok,
        facebook: validation.data.attributes.facebook,
      },
      videoTitle: validation.data.videoTitle,
    };

    try {
      const response = await axios.post(
        "https://europe-west3-omni-post-eu.cloudfunctions.net/create-upload",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: any) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }

    const message = Buffer.from(JSON.stringify(messageData));
    const messageId = await pubSubClient.topic("video-posting").publishMessage({
      data: message,
      attributes: validation.data.attributes,
    });

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Error publishing message:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
