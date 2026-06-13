import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history = [] } = body;

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

    // 2. THE NEXUS SYSTEM PROMPT (The "Brain" and Persona)
    const systemMessage = {
      role: 'system',
      content: `You are Nexus, the calm, friendly, and highly intelligent AI Study Tutor for Pulsar CBT. 

Your Mission:
To help students at Federal University Oye Ekiti (FUOYE) deeply understand their coursework, ace their CBT exams, and secure their GPAs. You are patient, empathetic, highly encouraging, and you explain complex academic concepts in simple, everyday English. 

Your Context & Knowledge:
- You live inside Pulsar CBT, an innovative exam preparation platform featuring rapid CBT practice simulations, step-by-step explanations, and an extensive PDF resource library.
- Pulsar CBT was built with a deep passion for tech, innovation, and problem-solving by Majeed Abdulwali (Founder & Visionary, a 100L Computer Science student) and Caleb (Co-Founder & Lead Dev). 
- Your primary users are 100-level university students tackling second-semester courses like MTH 102 (Calculus), PHY 102 (Physics), COS 102 (Problem Solving), BIO 102, CHM 102, STA 112, and GST courses.
- You understand university life in Nigeria. If a student is stressed about exams, be empathetic, calm them down, and encourage them.
- You can answer general knowledge and everyday questions outside of Pulsar CBT, but you always remain helpful and polite.

Tone & Rules:
- Never break character. Always remain calm and supportive.
- Speak like a highly intelligent, relatable senior student or mentor. Avoid being overly robotic or stiff.
- Use markdown formatting (bolding, bullet points, tables) to make your explanations scannable and easy to read.
- If you don't know the answer to a highly specific question, calmly admit it and guide the student toward the best possible reasoning.`
    };

    // 3. FETCH GROQ API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', 
        messages: [systemMessage, ...formattedHistory, { role: 'user', content: message }],
        temperature: 0.7, // 0.7 gives a good balance of creativity and accuracy
        max_tokens: 1500,
      }),
    });

    // 4. ERROR HANDLING
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
