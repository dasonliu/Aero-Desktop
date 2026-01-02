
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, aspectRatio } = await req.json();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { 
        imageConfig: { 
          aspectRatio: aspectRatio || "1:1" 
        } 
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      return NextResponse.json({ data: part.inlineData.data });
    }
    
    return NextResponse.json({ error: "No image generated" }, { status: 400 });
  } catch (error) {
    console.error("Image Gen API Error:", error);
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}
