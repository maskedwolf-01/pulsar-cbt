import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history = [], userName = 'Scholar', userDept = 'Student' } = body;

    if (!message) {
      return NextResponse.json({ error: "Message payload is empty." }, { status: 400 });
    }

    // 1. SANITIZE HISTORY
    const formattedHistory = history
      .filter((msg: any) => msg && msg.content && msg.content.trim() !== '')
      .map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

    // 2. THE PERSONALIZED SYSTEM PROMPT
    const systemMessage = {
      role: 'system',
      content: `You are Nexus, the calm, friendly, and highly intelligent AI Study Tutor for Pulsar CBT. 

Your Current Student:
You are speaking directly to ${userName}, a student in the ${userDept} department at Federal University Oye Ekiti (FUOYE). 
- Occasionally use their name to make the conversation feel personal and warm.
- If they ask for examples, try to tailor them to ${userDept} if it makes sense.

Your Mission:
To help students deeply understand their coursework, ace their CBT exams, and secure their GPAs. You are patient, empathetic, and highly encouraging. Explain complex academic concepts in simple, everyday English. 

Your Context:
- You live inside Pulsar CBT, built with a deep passion for tech and innovation by Majeed Abdulwali (Founder & 100L Computing Governor) and Caleb (Co-Founder & Lead Dev). 
- Primary subjects: MTH 102, PHY 102, COS 102, BIO 102, CHM 102, STA 112, and GST courses.
- You understand Nigerian university life. Calm the student down if they are stressed about exams.

Tone & Rules:
- Never break character. Speak like a highly intelligent, relatable senior student/mentor.
- Use markdown formatting (bolding, bullet points, tables) to make your explanations scannable.
- If you don't know the answer, calmly admit it and guide them toward the best possible reasoning.`
    };

    // 3. THE FAILOVER CASCADE (Load Balancing)
    // Grabs a comma-separated list of keys from your environment variables
    const rawKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '';
    const apiKeys = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);

    if (apiKeys.length === 0) {
      return NextResponse.json({ error: "API keys are not configured." }, { status: 500 });
    }

    let aiReply = null;

    // Loop through the keys until one succeeds
    for (let i = 0; i < apiKeys.length; i++) {
      const currentKey = apiKeys[i];
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant', 
          messages: [systemMessage, ...formattedHistory, { role: 'user', content: message }],
          temperature: 0.7, 
          max_tokens: 1500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        aiReply = data.choices[0].message.content;
        break; // Success! Break out of the loop.
      } else if (response.status === 429) {
        // Rate limit hit! Skip to the next key invisibly.
        console.warn(`Key ${i + 1} hit rate limit (429). Failing over to next key...`);
        continue; 
      } else {
        // A hard error (like a bad prompt). Throw it immediately.
        const errorText = await response.text();
        console.error(`Groq API Error on key ${i + 1}:`, response.status, errorText);
        return NextResponse.json(
          { error: `Groq Error (${response.status}): ${errorText}` },
          { status: response.status }
        );
      }
    }

    // If we looped through ALL keys and aiReply is still null, all servers are maxed out.
    if (!aiReply) {
      return NextResponse.json(
        { error: 'All AI servers are currently at maximum capacity. Please wait 10 seconds and try again.' },
        { status: 429 }
      );
    }

    return NextResponse.json({ reply: aiReply });

  } catch (error: any) {
    console.error("API Route Execution Error:", error);
    return NextResponse.json(
      { error: 'Internal Server Error while executing AI request.' },
      { status: 500 }
    );
  }
}
