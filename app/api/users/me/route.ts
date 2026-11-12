import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel"; // Assuming you have this user model in your database

connect(); // Ensure MongoDB connection is established

export async function GET(request: NextRequest) {
  try {
    // Retrieve token/session from the request
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user based on the email from the token
    const user = await User.findOne({ email: token.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the username and email
    return NextResponse.json({
      username: user.username,
      email: user.email,
    });
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
