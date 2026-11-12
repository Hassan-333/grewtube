import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connect } from '@/dbConfig/dbConfig';
import User from '@/models/userModel';

// Always run on request so the chart reflects current data.
export const dynamic = 'force-dynamic';

// Returns the winning vote for every saved video across all users,
// which the dashboard chart aggregates. Requires a signed-in user.
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connect();
    const users = await User.find({}, { 'links.url': 1, 'links.winningVote': 1 });

    const winningVotes = users.flatMap((user) =>
      (user.links ?? [])
        .filter((link) => link.winningVote)
        .map((link) => ({
          url: link.url,
          winningVoteCount: 1,
          label: link.winningVote,
        }))
    );

    return NextResponse.json(winningVotes, { status: 200 });
  } catch (error) {
    console.error('Error fetching winning votes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
