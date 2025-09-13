import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Achievement from '@/models/Achievement';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const achievements = await Achievement.find({ userId: user._id })
      .sort({ earnedAt: -1 });

    const userStats = {
      level: user.level,
      xp: user.xp,
      streak: user.streak,
    };

    return NextResponse.json({
      achievements,
      userStats,
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
