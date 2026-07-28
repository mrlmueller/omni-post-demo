// /app/api/admin/create-stripe-user/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "../../../lib/admin/firebaseAdmin";
import { isAdminUser } from "../../../lib/admin/adminConfig";

/**
 * Diese Route "triggert" indirekt die Anlage eines Stripe-Customers
 * über die Firestore Stripe Payments Extension.
 *
 * 1. Admin wird authentifiziert
 * 2. Wir lesen die UID aus dem Request-Body
 * 3. In /users/{uid}/checkout_sessions/ fügen wir ein Doc hinzu
 * 4. Die Extension erstellt automatisch den Stripe-Customer
 *    (sobald sie die Checkout-Session anlegt).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { admin, firestore, auth } = getFirebaseAdmin();
    
    // 1. Validate token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token is missing or invalid" },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(" ")[1];
    
    // 2. Verify token and check admin access
    try {
      const decodedToken = await auth.verifyIdToken(token);
      
      // Check if user is admin
      if (!isAdminUser(decodedToken.uid)) {
        console.warn(`Unauthorized admin access attempt by user: ${decodedToken.uid}`);
        return NextResponse.json(
          { error: "Forbidden - Not authorized" },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // 3. Get UID from request body
    const { uid } = await request.json();
    if (!uid) {
      return NextResponse.json(
        { error: "No UID provided in request body." },
        { status: 400 }
      );
    }

    // 4. Check if user already has a Stripe ID
    const userDocRef = firestore.collection("users").doc(uid);
    const userSnap = await userDocRef.get();
    
    if (!userSnap.exists) {
      return NextResponse.json(
        { error: `User with UID ${uid} does not exist in Firestore.` },
        { status: 404 }
      );
    }
    
    const userData = userSnap.data() || {};
    if (userData.stripeId) {
      return NextResponse.json(
        { message: `User ${uid} already has a stripeId: ${userData.stripeId}` },
        { status: 400 }
      );
    }

    /**
     * 5. Create a new entry in /checkout_sessions
     *
     * You must provide at least one valid Price that exists
     * in Stripe (e.g., a free plan or $0 product). The key is "price" and MUST
     * be one of the Stripe prices you've defined.
     *
     * For a free product:
     *    const FREE_PRICE_ID = "price_12345"
     * For a trial subscription, you can define `trial_period_days`.
     *
     * success_url and cancel_url can be set generically,
     * the extension requires them (if the checkout is called).
     */
    const checkoutSessionsRef = userDocRef.collection("checkout_sessions");
    const docRef = await checkoutSessionsRef.add({
      price: "price_1QRz6s2MjSfMyWwFCqevn9Zx", // <-- Your $0 price or trial price
      success_url: "https://example.com/success", // You can customize
      cancel_url: "https://example.com/cancel",
      allow_promotion_codes: true,
      // Optional: 30-day trial
      trial_period_days: 30,
    });

    /**
     * The extension will now create a Stripe Customer as soon as
     * it processes this document. If the user already has a Customer,
     * it will be reused. But since the user didn't have a stripeId,
     * a new customer will be created here.
     */

    return NextResponse.json({
      message: `Checkout session created for user ${uid}, docId = ${docRef.id}. 
                The extension should create the Stripe customer soon.`,
    });
  } catch (error: unknown) {
    console.error("Error in create-stripe-user route:", error);
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}