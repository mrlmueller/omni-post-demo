import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "../../../lib/admin/firebaseAdmin";
import { isAdminUser } from "../../../lib/admin/adminConfig";

interface UserSocials {
  [key: string]: string;
}

interface UserWithSocialsOrStripeId {
  uid: string;
  displayName: string;
  email: string;
  lastLogin: string | null;
  socials?: UserSocials;
  stripeId?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
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

    // 3. Get users data
    const usersRef = firestore.collection("users");
    const usersSnapshot = await usersRef.get();

    // Change the array and interface name if you'd like
    const allUsers: UserWithSocialsOrStripeId[] = [];
    const userIdsToFetch: string[] = [];

    // Collect ALL user IDs
    usersSnapshot.forEach((userDoc) => {
      userIdsToFetch.push(userDoc.id);
    });

    // Fetch user records from Firebase Auth in batches
    const batchSize = 1000; // Maximum allowed by Firebase
    for (let i = 0; i < userIdsToFetch.length; i += batchSize) {
      const batchIds = userIdsToFetch.slice(i, i + batchSize);
      const getUsersResult = await auth.getUsers(
        batchIds.map((uid) => ({ uid }))
      );

      // Map user records by uid for quick access
      const userRecordsMap = new Map<string, any>();
      getUsersResult.users.forEach((userRecord) => {
        userRecordsMap.set(userRecord.uid, userRecord);
      });

      // Build the result array
      batchIds.forEach((uid) => {
        const userRecord = userRecordsMap.get(uid);
        const userDoc = usersSnapshot.docs.find((doc) => doc.id === uid);
        const userData = userDoc?.data();

        // Safely handle userDoc data
        if (userData) {
          const socials = userData.socials as UserSocials | undefined;
          const stripeId = userData.stripeId as string | undefined;

          allUsers.push({
            uid,
            displayName: userRecord?.displayName || "",
            email: userRecord?.email || "",
            lastLogin: userRecord?.metadata?.lastSignInTime || null,
            socials,
            stripeId,
          });
        }
      });
    }

    // Return the collected user data
    return NextResponse.json(allUsers, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: errorMessage || "Failed to fetch users" },
      { status: 500 }
    );
  }
}