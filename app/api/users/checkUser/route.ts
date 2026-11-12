import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel"; // Your user model

connect(); // Ensure MongoDB is connected

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ exists: false, error: "Email and password are required" }, { status: 400 });
    }

    // Find the user in the database by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ exists: false, error: "User not found" });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ exists: false, error: "Invalid password" }, { status: 401 });
    }

    // If the user exists and password is correct
    return NextResponse.json({ exists: true });
  } catch (error: any) {
    console.error("Error checking user:", error);
    return NextResponse.json({ exists: false, error: error.message }, { status: 500 });
  }
}
