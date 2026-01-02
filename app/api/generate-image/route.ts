
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, aspectRatio } = await req.json();
    
    // 强制检查 API_KEY 是否存在
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined") {
      return NextResponse.json({ 
        error: "API Key is missing. Please refresh and select a key from a paid GCP project.",
        code: "KEY_MISSING"
      }, { status: 401 });
    }

    // 创建实例，使用最新的 API Key
    const ai = new GoogleGenAI({ apiKey });
    
    /**
     * 升级到 gemini-3-pro-image-preview 
     * 该模型支持 googleSearch 工具，能够根据实时信息生成更准确的品牌图标
     */
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { 
        parts: [{ text: prompt }] 
      },
      config: { 
        imageConfig: { 
          aspectRatio: aspectRatio || "1:1",
          imageSize: "1K" // Pro 模型特有配置
        },
        // 允许模型通过搜索来了解特定网站或品牌的视觉特征
        tools: [{ googleSearch: {} }] 
      }
    });

    if (!response.candidates || response.candidates.length === 0) {
      return NextResponse.json({ 
        error: "AI returned no candidates. This usually happens when the prompt is blocked by safety filters.",
        code: "SAFETY_BLOCKED"
      }, { status: 400 });
    }

    const content = response.candidates[0].content;
    const imagePart = content?.parts?.find(p => p.inlineData);

    if (imagePart?.inlineData?.data) {
      return NextResponse.json({ data: imagePart.inlineData.data });
    }
    
    return NextResponse.json({ 
      error: "The AI generated text but no image. Try a more descriptive prompt.",
      debug: content?.parts?.[0]?.text
    }, { status: 400 });

  } catch (error: any) {
    console.error("Critical Image Generation Error:", error);
    
    const errorMsg = error.message || "";
    
    // 处理 403 或 404 (通常是权限或选 Key 问题)
    if (errorMsg.includes("403") || errorMsg.includes("PermissionDenied") || errorMsg.includes("404") || errorMsg.includes("Requested entity was not found")) {
      return NextResponse.json({ 
        error: "Your API Key doesn't have permission for Pro Image Generation. Ensure it's from a paid project with billing enabled.",
        code: "KEY_RESTRICTED"
      }, { status: 403 });
    }

    return NextResponse.json({ 
      error: "Server Error: " + (errorMsg || "Unknown error during generation.") 
    }, { status: 500 });
  }
}
