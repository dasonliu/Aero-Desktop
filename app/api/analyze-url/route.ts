
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract the brand name or website title from this URL: ${url}. Return ONLY the name.`,
    });
    
    return NextResponse.json({ name: response.text?.trim() || "App" });
  } catch (error) {
    console.error("Analyze URL Error:", error);
    return NextResponse.json({ name: "App" });
  }
}
