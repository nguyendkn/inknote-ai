"use server";

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function generateNoteContent(
  prompt: string,
  currentContent: string,
  modelName: string = "gemini-2.0-flash",
): Promise<string> {
  if (!apiKey) {
    console.warn("No API Key found for Gemini");
    return "Error: API Key is missing. Please configure GOOGLE_API_KEY environment variable.";
  }

  try {
    const fullPrompt = `
You are an AI assistant in a Markdown note-taking app.

Current Note Content:
${currentContent}

User Request:
${prompt}

Please provide the text that should be added or replace the selection. 
If the user asks to summarize, return a summary.
If the user asks to continue writing, return the next paragraph.
Return ONLY the markdown content, no extra conversational filler.
`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: fullPrompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "\n\n(Error generating content. Please check your API key or connection.)";
  }
}
