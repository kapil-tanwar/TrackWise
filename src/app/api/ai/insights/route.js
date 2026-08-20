import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserFinancialContext } from '@/lib/ai/financialData';
import ai from '@/lib/ai/gemini';
import { INSIGHTS_PROMPT } from '@/lib/ai/prompts';
import { Type } from '@google/genai';

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
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

    const insights = JSON.parse(response.text);
    return NextResponse.json(insights);
  } catch (error) {
    console.error('Insights API Error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
