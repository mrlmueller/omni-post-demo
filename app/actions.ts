"use server";
import { DEFAULT_LOCALE, Locale } from "@/lib/i18n";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function changeLocale(new_locale: string) {
  try {
    const cookieStore = await cookies();
    if (!new_locale || typeof new_locale !== "string") {
      revalidatePath("/");
      return { success: true };
    }

    // Check if locale is valid
    if (!(new_locale in Locale)) {
      cookieStore.set("locale", DEFAULT_LOCALE);
      revalidatePath("/");
      return { success: true };
    }

    // Set the cookie with long expiration (1 year)
    cookieStore.set("locale", new_locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error changing locale:", error);
    return { success: false, error };
  }
}
