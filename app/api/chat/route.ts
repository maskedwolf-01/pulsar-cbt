import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history = [] } = body;

    if (!message) {
      return NextResponse.json({ error: "Message payload is empty." }, { status: 400 });
    }

    // 1. SANITIZE HISTORY: Groq will crash (400) if any message content is empty or null
    const formattedHistory = history
      .filter((msg: any) => msg && msg.content && msg.content.trim() !== '')
      .map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

    // 2. SYSTEM PROMPT
    const systemMessage = {
      role: 'system',
      content: 'You are a helpful, encouraging AI tutor for university students. Explain concepts simply and clearly. Do not use overly complex jargon unless necessary. Keep your answers concise and directly answer the student\'s question.'
    };

    // 3. FETCH GROQ API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Updated to Groq's newest, fastest model
        messages: [systemMessage, ...formattedHistory, { role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    // 4. ERROR HANDLING: Pass the exact Groq error back for debugging
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error Details:", response.status, errorText);
      return NextResponse.json(
        { error: `Groq Error (${response.status}): ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiReply = data.choices[0].message.content;

    return NextResponse.json({ reply: aiReply });

  } catch (error: any) {
    console.error("API Route Execution Error:", error);
    return NextResponse.json(
      { error: 'Internal Server Error while executing AI request.' },
      { status: 500 }
    );
  }
}
