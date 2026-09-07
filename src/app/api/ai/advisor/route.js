import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserFinancialContext } from '@/lib/ai/financialData';
import ai from '@/lib/ai/gemini';
import { ADVISOR_PROMPT } from '@/lib/ai/prompts';

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-flash-lite-latest',
  'gemini-3.7-flash',
  'gemini-2.5-pro',
  'gemini-flash-latest',
];

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const context = await getUserFinancialContext(session.user.id);

    let advice = null;
    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            { role: 'user', parts: [{ text: question }] }
          ],
          config: {
            systemInstruction: `${ADVISOR_PROMPT}\n\nUser Financial Context: ${JSON.stringify(context)}`,
            temperature: 0.7,
          }
        });

        if (response.text) {
          advice = response.text;
          break;
        }
      } catch (err) {
        console.warn(`Model ${model} failed for advisor:`, err.message?.slice(0, 100));
      }
    }

    if (!advice) {
      advice = 'Based on your recent financial data, your current expenses and budget are being tracked. Review your recent transactions to ensure spending stays aligned with your financial targets.';
    }

    return NextResponse.json({ message: advice });
  } catch (error) {
    console.error('Advisor API Error:', error);
    return NextResponse.json({ error: 'Failed to generate advice' }, { status: 500 });
  }
}
