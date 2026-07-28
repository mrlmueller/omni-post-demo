import { getCheckoutUrl } from "@/stripe/stripePayment";
import { signInWithPopup } from "firebase/auth";
import { app, auth, provider } from "./firebaseConfig";

export const handleLoginWithGoogle = async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectCheckout = urlParams.get("redirectCheckout") === "true";

    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const token = await user.getIdToken();
    const name = user.displayName;
    const email = user.email;

    // Check if the user exists in the database
    const doesUserExistResponse = await fetch("/api/does-user-exist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const { exists } = await doesUserExistResponse.json();

    if (exists) {
      // Update existing user info asynchronously in background
      fetch("/api/save-user-to-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          displayName: name,
          email: email,
          photoURL: user.photoURL,
          providerId: user.providerData[0].providerId,
          token,
        }),
      });

      // Set the session cookie
      await fetch("/api/setCookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user }),
      });

      if (redirectCheckout) {
        // User wants to go directly to checkout
        const priceId = "price_1QRz6s2MjSfMyWwFCqevn9Zx"; // Adjust as needed
        try {
          const checkoutUrl = await getCheckoutUrl(app, priceId);
          if (checkoutUrl) {
            window.location.href = checkoutUrl;
          } else {
            console.error("No checkout URL returned.");
            window.location.href = "/";
          }
        } catch (err) {
          console.error("Error fetching checkout URL", err);
          window.location.href = "/";
        }
      } else {
        // Just redirect to home
        window.location.href = "/";
      }
    } else {
      console.log("User does not exist in the database");
      const redirectUrl = `/create-account-google?token=${encodeURIComponent(
        token
      )}&name=${encodeURIComponent(name!)}&email=${encodeURIComponent(email!)}`;

      // If `redirectCheckout` was requested originally, we should preserve it.
      // That way, after account creation and login, the user is redirected to checkout.
      // We can append `&redirectCheckout=true` if needed:
      const finalRedirectUrl = redirectCheckout
        ? `${redirectUrl}&redirectCheckout=true`
        : redirectUrl;

      window.location.href = finalRedirectUrl;
    }
  } catch (error) {
    console.error("Error during Google login", error);
    throw error;
  }
};
