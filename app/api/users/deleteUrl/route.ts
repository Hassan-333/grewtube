import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

export async function DELETE(request: NextRequest) {
  try {
    await connect(); // Ensure MongoDB is connected

    const { urlId } = await request.json(); // Expect the _id of the URL to be deleted

    console.log("URL _id to delete:", urlId); // Debug: Log the URL _id to delete

    // Get the user's JWT token
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = token.email;

    // Find the user by their email
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Filter the `links` array to remove the item with the given _id
    user.links = user.links.filter(link => link._id.toString() !== urlId);

    console.log("Remaining links after deletion:", user.links); // Debug: Log remaining links

    // Save the updated user document
    await user.save();

    return NextResponse.json({ message: "URL deleted successfully", links: user.links });
  } catch (error: any) {
    console.error("Error deleting URL:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
