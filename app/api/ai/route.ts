import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function POST(req: Request) {
  try {
    const { type, prompt, context } = await req.json();

    let systemInstruction = "";

    // MODE 1: NEXUS CHAT
    if (type === 'chat') {
      systemInstruction = "You are Nexus 1.0, an advanced academic AI assistant for PULSAR CBT. Your tone is futuristic, encouraging, and precise. Keep answers concise (under 100 words) unless asked for details.";
    } 
    // MODE 2: EXAM EXPLANATION (Automatic)
    else if (type === 'explain') {
      systemInstruction = `You are an expert tutor. The student failed a question. 
      Question: "${context.question}"
      Student chose: "${context.userAnswer}" (Incorrect)
      Correct Answer: "${context.correctAnswer}"
      
      Task: Explain briefly (max 2 sentences) why the student's answer is wrong and why the correct answer is right. Do not be condescending.`;
    }

    // Call Google Gemini API
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemInstruction}\n\nUser Query: ${prompt}` }]
        }]
      })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Nexus systems are recalibrating. Try again.";

    return NextResponse.json({ reply });

  } catch (error) {
    return NextResponse.json({ reply: "Connection to Neural Net failed." }, { status: 500 });
  }
}
  
