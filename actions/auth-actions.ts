"use server";

import { cookies } from "next/headers";
import { HOME_ROUTE, ROOT_ROUTE, SESSION_COOKIE_NAME } from "@/constants";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export async function createSession(uid: string) {
  // In Next.js 15, cookies() returns a Promise
  const cookieStore = await cookies();
  
  // Set cookie with the updated API
  const cookie: ResponseCookie = {
    name: SESSION_COOKIE_NAME,
    value: uid,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
  };
  
  cookieStore.set(cookie);
  return { success: true, redirectUrl: HOME_ROUTE };
}

export async function removeSession() {
  // In Next.js 15, cookies() returns a Promise
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return { success: true, redirectUrl: ROOT_ROUTE };
}
