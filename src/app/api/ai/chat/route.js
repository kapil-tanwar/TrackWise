import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserFinancialContext } from '@/lib/ai/financialData';
import ai from '@/lib/ai/gemini';
import { CHATBOT_PROMPT } from '@/lib/ai/prompts';
import ChatHistory from '@/models/ChatHistory';
import dbConnect from '@/lib/db';

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

    const { message, history: clientHistory } = await req.json();
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

    let contents = [];
    if (clientHistory && Array.isArray(clientHistory) && clientHistory.length > 0) {
      contents = clientHistory.slice(-8).map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.message }]
      }));
    } else {
      const recentHistory = await ChatHistory.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      recentHistory.reverse();
      contents = recentHistory.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.message }]
      }));
    }

    // Ensure the current user message is in contents if not present
    if (contents.length === 0 || contents[contents.length - 1].parts[0].text !== message) {
      contents.push({ role: 'user', parts: [{ text: message }] });
    }

    let aiMessage = null;
    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: contents,
          config: {
            systemInstruction: `${CHATBOT_PROMPT}\n\nUser Financial Context: ${JSON.stringify(context)}`,
            temperature: 0.7,
          }
        });

        if (response.text) {
          aiMessage = response.text;
          break;
        }
      } catch (err) {
        console.warn(`Model ${model} failed for chat:`, err.message?.slice(0, 100));
      }
    }

    if (!aiMessage) {
      const current = context?.currentMonth || {};
      aiMessage = `Here is a summary of your current finances: Your monthly income is ₹${(current.income || 0).toLocaleString()} with expenses at ₹${(current.expenses || 0).toLocaleString()}. Budget limit is ₹${(context?.userInfo?.budgetLimit || 0).toLocaleString()}. Feel free to ask specific questions about your transactions or spending habits!`;
    }

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

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    await ChatHistory.deleteMany({ userId: session.user.id });

    return NextResponse.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Chat History Delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete history' }, { status: 500 });
  }
}
