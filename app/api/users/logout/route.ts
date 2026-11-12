import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/nextauth-options"; // Your NextAuth configuration

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No active session" }, { status: 401 });
    }

    // Get the base URL (host) to construct an absolute URL
    const { headers } = request;
    const host = headers.get("host");
    const protocol = headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    // Optionally handle server-side session cleanup here if using a database or session store

    // Redirect to login after logging out
    return NextResponse.redirect(`${baseUrl}/login`);
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}






