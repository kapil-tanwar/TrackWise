import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserFinancialContext } from '@/lib/ai/financialData';
import ai from '@/lib/ai/gemini';
import { INSIGHTS_PROMPT } from '@/lib/ai/prompts';
import { Type } from '@google/genai';

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-flash-lite-latest',
  'gemini-3.7-flash',
  'gemini-2.5-pro',
  'gemini-flash-latest',
];

function generateRuleBasedInsights(context) {
  const current = context?.currentMonth || {};
  const income = Number(current.income) || 0;
  const expenses = Number(current.expenses) || 0;
  const savings = income - expenses;
  const savingsRate = income > 0 ? Number(((savings / income) * 100).toFixed(1)) : 0;
  const budgetLimit = Number(context?.userInfo?.budgetLimit) || 0;
  const budgetUsage = budgetLimit > 0 ? Number(((expenses / budgetLimit) * 100).toFixed(1)) : 0;
  const topCategory = current.topCategory || 'None';
  const topCategoryAmount = Number(current.topCategoryAmount) || 0;

  const strengths = [];
  const concerns = [];
  const recommendations = [];

  if (savingsRate >= 20) {
    strengths.push(`Strong savings rate of ${savingsRate}% this month with ₹${savings.toLocaleString()} saved.`);
  } else if (savingsRate > 0) {
    strengths.push(`Positive cash flow retaining ₹${savings.toLocaleString()} after expenses.`);
  } else if (income > 0) {
    concerns.push(`Expenses (₹${expenses.toLocaleString()}) match or exceed income (₹${income.toLocaleString()}).`);
  }

  if (budgetLimit > 0) {
    if (budgetUsage <= 75) {
      strengths.push(`Budget utilization is healthy at ${budgetUsage}% of your ₹${budgetLimit.toLocaleString()} limit.`);
    } else if (budgetUsage <= 100) {
      concerns.push(`Budget usage is at ${budgetUsage}% of ₹${budgetLimit.toLocaleString()} limit.`);
      recommendations.push('Slow down discretionary spending for the remainder of the month to stay within budget.');
    } else {
      concerns.push(`Budget exceeded by ₹${(expenses - budgetLimit).toLocaleString()} (${budgetUsage}% used).`);
      recommendations.push('Review recent expenses and cut non-essential purchases to regain budget control.');
    }
  } else {
    recommendations.push('Set a monthly budget limit in Settings to unlock automated budget health tracking.');
  }

  if (topCategory && topCategory !== 'None') {
    recommendations.push(`Monitor your ${topCategory} category (₹${topCategoryAmount.toLocaleString()}), currently your top expense area.`);
  }

  if (strengths.length === 0) {
    strengths.push('Active tracking enabled: logging every transaction helps optimize future savings.');
  }
  if (concerns.length === 0) {
    strengths.push('No urgent financial red flags detected for this billing period.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Continue maintaining consistent records to improve multi-month predictive insights.');
  }

  const summary = income > 0
    ? `You recorded ₹${income.toLocaleString()} in income and ₹${expenses.toLocaleString()} in expenses, leaving ₹${savings.toLocaleString()} in net savings (${savingsRate}% savings rate).`
    : `You recorded ₹${expenses.toLocaleString()} in total expenses this period. Add income entries to track your savings rate and net balance.`;

  return {
    summary,
    strengths,
    concerns,
    recommendations,
  };
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let month = new Date().getMonth();
    let year = new Date().getFullYear();

    try {
      const body = await req.json();
      if (body.month !== undefined) month = body.month;
      if (body.year !== undefined) year = body.year;
    } catch (e) {
      // Body might be empty, ignore
    }

    const context = await getUserFinancialContext(session.user.id, month, year);

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['summary', 'strengths', 'concerns', 'recommendations'],
    };

    // Try available Gemini models with fallback
    let insights = null;
    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            { role: 'user', parts: [{ text: 'Generate monthly insights based on my financial context.' }] }
          ],
          config: {
            systemInstruction: `${INSIGHTS_PROMPT}\n\nUser Financial Context: ${JSON.stringify(context)}`,
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
          }
        });

        if (response.text) {
          insights = JSON.parse(response.text);
          break;
        }
      } catch (modelErr) {
        console.warn(`Model ${model} failed for insights:`, modelErr.message?.slice(0, 100));
      }
    }

    // If all AI models failed or rate-limited, fall back to personalized rule-based financial analysis
    if (!insights) {
      insights = generateRuleBasedInsights(context);
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Insights API Error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
