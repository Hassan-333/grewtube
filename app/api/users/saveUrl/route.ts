
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connect } from "@/dbConfig/dbConfig";
import mongoose from "mongoose";
import User from "@/models/userModel";

// Ensure MongoDB is connected
connect();

// POST method handler for saving the video URL
export async function POST(request: NextRequest) {
  try {
    // Get the user's token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = token.email;

    const { videoUrl } = await request.json();

    // Find the user by email
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add the new URL to the user's links array
    user.links.push({ _id: new mongoose.Types.ObjectId(), url: videoUrl, createdAt: new Date() });

    // Save the updated user document
    const updatedUser = await user.save();

    // Respond with the updated links array
    return NextResponse.json({ message: "URL saved successfully", links: updatedUser.links });

  } catch (error: any) {
    console.error("Error handling POST request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET method handler for retrieving saved URLs
export async function GET(request: NextRequest) {
  try {
    // Get the user's token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = token.email;

    // Find the user by email
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the user's saved URLs (links)
    return NextResponse.json({ urls: user.links }, { status: 200 });

  } catch (error: any) {
    console.error("Error handling GET request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
