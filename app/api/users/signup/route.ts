

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

// Connect to MongoDB
connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { username, email, password, youtubeLink } = reqBody;


    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      links: youtubeLink ? [{ url: youtubeLink }] : [],
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Return all the user data in the response
    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        links: savedUser.links,
      },
    });
  } catch (error: any) {
    console.error("Error during signup:", error);
    if (error.name === 'ValidationError') {
      console.error("Validation error details:", error.errors);
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}