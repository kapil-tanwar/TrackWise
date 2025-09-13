import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';


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

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      currency: user.currency,
      budgetLimit: user.budgetLimit,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      themePreference: user.themePreference,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}


export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, currency, budgetLimit, themePreference } = await request.json();

    await dbConnect();

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        ...(name && { name }),
        ...(currency && { currency }),
        ...(budgetLimit !== undefined && { budgetLimit }),
        ...(themePreference && { themePreference }),
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      currency: user.currency,
      budgetLimit: user.budgetLimit,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      themePreference: user.themePreference,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
