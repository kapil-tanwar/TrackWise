import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserFinancialContext } from '@/lib/ai/financialData';
import ai from '@/lib/ai/gemini';
import { CHATBOT_PROMPT } from '@/lib/ai/prompts';
import ChatHistory from '@/models/ChatHistory';
import dbConnect from '@/lib/db';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await dbConnect();

    // Save user message to history
    await ChatHistory.create({
      userId: session.user.id,
      role: 'user',
      message: message,
    });

    // Get financial context
    const context = await getUserFinancialContext(session.user.id);

    // Get previous chat history (limit to last 10 for context window)
    const recentHistory = await ChatHistory.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Reverse to chronological order
    recentHistory.reverse();

    const contents = recentHistory.map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.message }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contents,
      config: {
        systemInstruction: `${CHATBOT_PROMPT}\n\nUser Financial Context: ${JSON.stringify(context)}`,
        temperature: 0.7,
      }
    });

    const aiMessage = response.text;

    // Save AI response to history
    await ChatHistory.create({
      userId: session.user.id,
      role: 'assistant',
      message: aiMessage,
    });

    return NextResponse.json({ message: aiMessage });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Return the last 50 messages
    const history = await ChatHistory.find({ userId: session.user.id })
      .sort({ createdAt: 1 })
      .limit(50)
      .lean();

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Chat History Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
