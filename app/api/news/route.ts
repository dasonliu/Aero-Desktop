
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { label } = await req.json();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Recent news for ${label}. Return a JSON array of objects with title, snippet, and url.`,
      config: { responseMimeType: "application/json" }
    });
    
    return NextResponse.json(JSON.parse(response.text || "[]"));
  } catch (error) {
    console.error("News API Error:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
