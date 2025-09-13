import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

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

    const notifications = [];


    if (user.budgetLimit > 0) {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const currentMonthExpenses = await Transaction.find({
        userId: user._id,
        type: 'expense',
        date: {
          $gte: currentMonthStart,
          $lte: currentMonthEnd,
        },
      });

      const totalExpenses = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
      const budgetUsedPercentage = (totalExpenses / user.budgetLimit) * 100;

      if (budgetUsedPercentage >= 100) {
        notifications.push({
          type: 'budget_exceeded',
          title: 'Budget Exceeded!',
          message: `You've exceeded your monthly budget of $${user.budgetLimit.toLocaleString()}`,
          severity: 'error',
          timestamp: new Date(),
        });
      } else if (budgetUsedPercentage >= 90) {
        notifications.push({
          type: 'budget_warning',
          title: 'Budget Warning',
          message: `You've used ${budgetUsedPercentage.toFixed(1)}% of your monthly budget`,
          severity: 'warning',
          timestamp: new Date(),
        });
      } else if (budgetUsedPercentage >= 75) {
        notifications.push({
          type: 'budget_alert',
          title: 'Budget Alert',
          message: `You've used ${budgetUsedPercentage.toFixed(1)}% of your monthly budget`,
          severity: 'info',
          timestamp: new Date(),
        });
      }
    }


    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (user.lastTransactionDate) {
      const lastDate = new Date(user.lastTransactionDate);
      const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 1) {
        notifications.push({
          type: 'streak_reminder',
          title: 'Keep Your Streak!',
          message: `Don't forget to log today's transactions to maintain your ${user.streak}-day streak`,
          severity: 'info',
          timestamp: new Date(),
        });
      }
    }


    const currentLevel = Math.floor(user.xp / 100) + 1;
    if (currentLevel > user.level) {
      notifications.push({
        type: 'level_up',
        title: 'Level Up!',
        message: `Congratulations! You've reached level ${currentLevel}`,
        severity: 'success',
        timestamp: new Date(),
      });
    }

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
