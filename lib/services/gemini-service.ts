import { GoogleGenAI } from "@google/genai";

/**
 * Generate note content using Gemini AI
 * For Electron app, API key is stored in app config
 */
export async function generateNoteContent(
  prompt: string,
  currentContent: string,
  modelName: string = "gemini-2.0-flash",
  apiKey?: string
): Promise<string> {
  // Try to get API key from parameter, env, or window config
  const key = apiKey ||
    (typeof process !== 'undefined' ? process.env.GOOGLE_API_KEY : undefined) ||
    (typeof window !== 'undefined' && (window as unknown as { __GEMINI_API_KEY__?: string }).__GEMINI_API_KEY__) ||
    "";

  if (!key) {
    console.warn("No API Key found for Gemini");
    return "Error: API Key is missing. Please configure your Gemini API key in Settings.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key });

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
