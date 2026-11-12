import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';

export async function POST(req: NextRequest) {
  // Identify the user from their session, never from the request body,
  // so one user can't change another user's data.
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { videoUrl, winningVote } = await req.json();
  if (!videoUrl || !winningVote) {
    return NextResponse.json({ error: 'videoUrl and winningVote are required' }, { status: 400 });
  }

  try {
    await connect();
    const result = await User.updateOne(
      { email: token.email, 'links.url': videoUrl },
      { $set: { 'links.$.winningVote': winningVote } }
    );

    // matchedCount, not modifiedCount: re-saving the same vote is not an error.
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'URL not found for the user' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Winning vote updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating winning vote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
