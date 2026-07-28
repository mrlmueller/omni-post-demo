// app/api/check-admin/route.ts

import { authenticateAdmin } from "@/app/lib/admin/authenticateAdmin";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract token from the request headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Authorization token is missing or invalid");
    }
    const token = authHeader.split(" ")[1];

    // Authenticate admin user
    await authenticateAdmin(token);

    // Since authenticateAdmin didn't throw an error, the user is an admin
    return NextResponse.json({ message: "User is an admin" }, { status: 200 });
  } catch (error: any) {
    console.error("Error verifying admin status:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to verify admin status" },
      { status: 500 }
    );
  }
}
