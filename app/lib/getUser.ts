import { cookies } from "next/headers";

export async function getUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("token")?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const response = await fetch(
      "https://europe-west3-omni-post-eu.cloudfunctions.net/get-user-data",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: accessToken,
          secret: process.env.CLOUD_FUNCTION_SECRET,
        }),
        next: { tags: ["profile_update"] },
      }
    );

    const data = await response.json();

    return {
      ...data,
      isPremium: false,
    };
  } catch (error) {
    console.error("Error fetching user data", error);
    return null;
  }
}
