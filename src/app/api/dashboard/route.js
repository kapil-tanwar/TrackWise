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


    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Six-month window for summary + category breakdown
    const sixMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const currentMonthTransactions = await Transaction.find({
      userId: user._id,
      date: {
        $gte: currentMonthStart,
        $lte: currentMonthEnd,
      },
    });

    // Use 6-month window when current month has no data (e.g. demo account)
    const hasCurrentMonthData = currentMonthTransactions.length > 0;

    const summaryTransactions = hasCurrentMonthData
      ? currentMonthTransactions
      : await Transaction.find({
          userId: user._id,
          date: { $gte: sixMonthsAgoStart },
        });

    const totalIncome = summaryTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = summaryTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = totalIncome - totalExpenses;


    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthTransactions = await Transaction.find({
        userId: user._id,
        date: {
          $gte: monthStart,
          $lte: monthEnd,
        },
      });

      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyTrend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        income: monthIncome,
        expenses: monthExpenses,
      });
    }

    // Build category breakdown from the same window as summary
    const expenseTransactions = summaryTransactions.filter(t => t.type === 'expense');
    const categoryMap = {};
    
    expenseTransactions.forEach(transaction => {
      if (categoryMap[transaction.category]) {
        categoryMap[transaction.category] += transaction.amount;
      } else {
        categoryMap[transaction.category] = transaction.amount;
      }
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([category, value]) => ({
      name: category,
      value: value,
    }));

    const achievements = await Achievement.find({ userId: user._id })
      .sort({ earnedAt: -1 })
      .limit(5);

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpenses,
        savings,
        isCurrentMonth: hasCurrentMonthData,
      },
      monthlyTrend,
      categoryBreakdown,
      achievements,
      user: {
        name: user.name,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        budgetLimit: user.budgetLimit,
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
