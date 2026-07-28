import { admin } from "./firebaseAdmin";

const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "";

export async function authenticateAdmin(
  token: string
): Promise<admin.auth.DecodedIdToken> {
  let decodedToken: admin.auth.DecodedIdToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(token);
  } catch (error: any) {
    console.error("Error verifying ID token:", error.message);
    throw new Error("Invalid or expired token");
  }

  if (decodedToken.uid !== ADMIN_USER_ID) {
    throw new Error("Unauthorized: Not an admin user");
  }

  return decodedToken;
}
