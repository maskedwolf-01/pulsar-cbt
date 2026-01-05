import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Using the most stable endpoint for free tier keys
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) return NextResponse.json({ reply: "SYSTEM: API Key Missing" });

  try {
    const { prompt, image_url } = await req.json();

    let requestBody: any = {
      contents: [{ parts: [{ text: "You are Nexus 1.0. Answer concisely. User: " + prompt }] }]
    };

    // HANDLE IMAGE UPLOAD (Multimodal)
    if (image_url) {
        // Fetch the image and convert to base64 for Gemini
        const imgRes = await fetch(image_url);
        const arrayBuffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        
        requestBody = {
            contents: [{
                parts: [
                    { text: prompt || "Analyze this image." },
                    { inline_data: { mime_type: "image/jpeg", data: base64 } }
                ]
            }]
        };
    }

    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.error) {
        // Fallback to Pro model if Flash fails
        if (data.error.message.includes("not found")) {
             return NextResponse.json({ reply: "NEXUS ERROR: Model mismatch. Please switch project to 'Pay-as-you-go' or create a new key in Google AI Studio." });
        }
        return NextResponse.json({ reply: `GOOGLE ERROR: ${data.error.message}` });
    }

    return NextResponse.json({ reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response." });

  } catch (error: any) {
    return NextResponse.json({ reply: `SERVER ERROR: ${error.message}` });
  }
    }
