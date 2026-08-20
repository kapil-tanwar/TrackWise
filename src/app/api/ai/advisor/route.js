import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserFinancialContext } from '@/lib/ai/financialData';
import ai from '@/lib/ai/gemini';
import { ADVISOR_PROMPT } from '@/lib/ai/prompts';

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        { role: 'user', parts: [{ text: question }] }
      ],
      config: {
        systemInstruction: `${ADVISOR_PROMPT}\n\nUser Financial Context: ${JSON.stringify(context)}`,
        temperature: 0.7,
      }
    });

    return NextResponse.json({ message: response.text });
  } catch (error) {
    console.error('Advisor API Error:', error);
    return NextResponse.json({ error: 'Failed to generate advice' }, { status: 500 });
  }
}
