import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  revalidateTag("profile_update");

  return NextResponse.json({ message: "Cookie deleted" });
}
