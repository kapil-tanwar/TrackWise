import mongoose from 'mongoose';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import dbConnect from '@/lib/db';

export async function getUserFinancialContext(userId, month = new Date().getMonth(), year = new Date().getFullYear()) {
  await dbConnect();

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Current month bounds
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // Previous month bounds
  const prevMonthStartDate = new Date(year, month - 1, 1);
  const prevMonthEndDate = new Date(year, month, 0, 23, 59, 59, 999);

  // Fetch transactions
  const currentMonthTransactions = await Transaction.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
  });

  const previousMonthTransactions = await Transaction.find({
    userId,
    date: { $gte: prevMonthStartDate, $lte: prevMonthEndDate },
  });

  // Calculate current month stats
  let income = 0;
  let expenses = 0;
  const categoryTotals = {};

  currentMonthTransactions.forEach((t) => {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expenses += t.amount;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    }
  });

  const savings = income - expenses;
  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(2) : 0;
  const budgetUsage = user.budgetLimit > 0 ? ((expenses / user.budgetLimit) * 100).toFixed(2) : 0;

  // Find top category
  let topCategory = 'None';
  let topCategoryAmount = 0;
  for (const [category, amount] of Object.entries(categoryTotals)) {
    if (amount > topCategoryAmount) {
      topCategoryAmount = amount;
      topCategory = category;
    }
  }

  // Calculate previous month stats
  let prevIncome = 0;
  let prevExpenses = 0;
  const prevCategoryTotals = {};

  previousMonthTransactions.forEach((t) => {
    if (t.type === 'income') {
      prevIncome += t.amount;
    } else {
      prevExpenses += t.amount;
      prevCategoryTotals[t.category] = (prevCategoryTotals[t.category] || 0) + t.amount;
    }
  });

  const prevSavings = prevIncome - prevExpenses;
  
  const expenseChange = prevExpenses > 0 ? (((expenses - prevExpenses) / prevExpenses) * 100).toFixed(2) : 0;
  const savingsChange = prevSavings > 0 ? (((savings - prevSavings) / prevSavings) * 100).toFixed(2) : 0;

  return {
    userInfo: {
      budgetLimit: user.budgetLimit,
      currency: user.currency,
    },
    currentMonth: {
      month: startDate.toLocaleString('default', { month: 'long' }),
      year,
      income,
      expenses,
      savings,
      savingsRate: Number(savingsRate),
      budgetUsage: Number(budgetUsage),
      topCategory,
      topCategoryAmount,
      categoryTotals,
    },
    previousMonth: {
      income: prevIncome,
      expenses: prevExpenses,
      savings: prevSavings,
    },
    trends: {
      expenseChangePercentage: Number(expenseChange),
      savingsChangePercentage: Number(savingsChange),
    }
  };
}
