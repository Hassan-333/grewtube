import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel"; // Assuming you have the User model

// Connect to MongoDB
connect();

export async function DELETE(request: NextRequest) {
  try {
    // Get the user's token (to identify the logged-in user)
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = token.email;

    // Find and delete the user from the database
    const deletedUser = await User.findOneAndDelete({ email: userEmail });

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the host information for absolute URL construction
    const { headers } = request;
    const host = headers.get("host");
    const protocol = headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    // Redirect to login page after account deletion (session will be invalidated automatically)
    return NextResponse.redirect(`${baseUrl}/`);
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Failed to delete account", message: error.message }, { status: 500 });
  }
}
