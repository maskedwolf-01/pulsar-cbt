import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // Format the conversation history for the AI
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Add a system prompt so the AI knows its job
    const systemMessage = {
      role: 'system',
      content: 'You are a helpful, encouraging AI tutor for university students. Explain concepts simply and clearly. Do not use overly complex jargon unless necessary. Keep your answers concise and directly answer the student\'s question.'
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Extremely fast, open-source model
        messages: [systemMessage, ...formattedHistory, { role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from AI provider');
    }

    const data = await response.json();
    const aiReply = data.choices[0].message.content;

    return NextResponse.json({ reply: aiReply });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: 'The AI is currently resting. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
