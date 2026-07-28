import Cookies from "js-cookie";
import { getAuth } from "firebase/auth";
import axios from "axios";

export async function getUserDataClient(): Promise<any | null> {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.error("No current user found");
    return null;
  }

  try {
    const currentToken = await currentUser.getIdToken();
    const cookieToken = Cookies.get("token");

    if (currentToken !== cookieToken) {
      try {
        await axios.post("/api/setCookie", {
          token: currentToken,
        });
        Cookies.set("token", currentToken);
      } catch (setCookieError) {
        console.error("Error setting cookie", setCookieError);
        return null;
      }
    }

    try {
      const response = await axios.post("/api/getUserData", {
        token: currentToken,
      });
      return response.data;
    } catch (getUserDataError) {
      console.error("Error fetching user data from API", getUserDataError);
      return null;
    }
  } catch (authError) {
    console.error("Error getting ID token", authError);
    return null;
  }
}
