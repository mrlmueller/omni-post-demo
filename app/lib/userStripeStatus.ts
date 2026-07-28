// userStatus.ts
import { getPremiumStatus } from "@/stripe/getPremiumStatus";
import { getAuth } from "firebase/auth";
import { app } from "./firebaseConfig";

let premiumStatus: boolean | null = null;
let userChecked = false;

export const getUserPremiumStatus = async (): Promise<boolean> => {
  if (premiumStatus !== null) {
    return premiumStatus;
  }

  if (!userChecked) {
    userChecked = true;
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        premiumStatus = await getPremiumStatus(app);
        return premiumStatus;
      } catch (error) {
        console.error("Error fetching premium status:", error);
        throw new Error("Failed to fetch premium status");
      }
    } else {
      throw new Error("User is not authenticated");
    }
  }

  throw new Error("Unable to determine premium status");
};
