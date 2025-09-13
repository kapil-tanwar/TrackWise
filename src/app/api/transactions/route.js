import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
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

    const transactions = await Transaction.find({ userId: user._id })
      .sort({ date: -1, createdAt: -1 });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { type, category, amount, date, notes } = await request.json();

    if (!type || !category || !amount || !date) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json(
        { message: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { message: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    
    const transaction = await Transaction.create({
      userId: user._id,
      type,
      category,
      amount,
      date: new Date(date),
      notes: notes || '',
    });

    
    const xpGained = Math.floor(amount / 10); 
    const newXp = user.xp + xpGained;
    const newLevel = Math.floor(newXp / 100) + 1; 

    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = user.streak;
    if (!user.lastTransactionDate) {
      newStreak = 1;
    } else {
      const lastDate = new Date(user.lastTransactionDate);
      const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        newStreak += 1;
      } else if (daysDiff > 1) {
        newStreak = 1;
      }
      
    }

    await User.findByIdAndUpdate(user._id, {
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastTransactionDate: today,
    });

    
    await checkAndAwardAchievements(user._id, newStreak, newLevel);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function checkAndAwardAchievements(userId, streak, level) {
  try {
    const existingAchievements = await Achievement.find({ userId });
    const achievementTitles = existingAchievements.map(a => a.title);

    const newAchievements = [];

    
    if (streak >= 7 && !achievementTitles.includes('7-Day Streak')) {
      newAchievements.push({
        userId,
        title: '7-Day Streak',
        description: 'Logged transactions for 7 consecutive days',
        icon: '🔥',
        xpReward: 50,
      });
    }

    if (streak >= 30 && !achievementTitles.includes('30-Day Streak')) {
      newAchievements.push({
        userId,
        title: '30-Day Streak',
        description: 'Logged transactions for 30 consecutive days',
        icon: '🏆',
        xpReward: 200,
      });
    }

    
    if (level >= 5 && !achievementTitles.includes('Level 5')) {
      newAchievements.push({
        userId,
        title: 'Level 5',
        description: 'Reached level 5',
        icon: '⭐',
        xpReward: 100,
      });
    }

    if (level >= 10 && !achievementTitles.includes('Level 10')) {
      newAchievements.push({
        userId,
        title: 'Level 10',
        description: 'Reached level 10',
        icon: '🌟',
        xpReward: 300,
      });
    }

    
    if (newAchievements.length > 0) {
      await Achievement.insertMany(newAchievements);
      
      
      const totalXpReward = newAchievements.reduce((sum, a) => sum + a.xpReward, 0);
      if (totalXpReward > 0) {
        await User.findByIdAndUpdate(userId, {
          $inc: { xp: totalXpReward }
        });
      }
    }
  } catch (error) {
    console.error('Achievement check error:', error);
  }
}
