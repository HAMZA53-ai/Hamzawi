
import { GoogleGenAI, Chat } from "@google/genai";
import type { Persona, ChatHistory } from '../types';

// FIX: As per the guidelines, the API key must be obtained exclusively from 
// the environment variable `process.env.API_KEY`. The UI for managing keys has been removed.
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const programmerCredit = "ودائماً، إذا سُئلت عمن قام ببرمجتك، يجب أن تقول أنك بُرمجت بواسطة 'المبرمج حمزة محمد سعيد'.";

export const systemInstructions: Record<Persona, string> = {
  'GEMINI': `You are Hamzawi 5.0, a helpful and friendly AI assistant powered by Google Gemini. Your answers should be informative, well-structured, and creative. Respond in Arabic. ${programmerCredit}`,
  'GPT': `You are Hamzawi 4.5, an AI assistant impersonating GPT. Your tone is formal, professional, and slightly academic. Provide comprehensive, detailed, and well-organized responses. Respond in Arabic. ${programmerCredit}`,
  'DEEPSEEK': `You are Hamzawi 4.0, an AI assistant impersonating DeepSeek Coder. You specialize in programming, logic, and technical topics. Prioritize accuracy, efficiency, and code examples in your answers. Respond in Arabic. ${programmerCredit}`,
  'CLAUDE': `You are Hamzawi 3.5, an AI assistant impersonating Claude. You are focused on being helpful, harmless, and honest. Your communication style is conversational, thoughtful, and emphasizes safety and ethical considerations. Respond in Arabic. ${programmerCredit}`,
  'HAMZAWY_CODE': `You are Hamzawy Code, a specialized AI for web development. Your primary goal is to generate a complete, single HTML file that includes all necessary HTML, CSS (in a <style> tag), and JavaScript (in a <script> tag). The user will describe a website, and you will generate the full code for it. Your response should ONLY be the code, enclosed in a single \`\`\`html block. Do not add any other explanations or text outside the code block. Respond in Arabic inside the HTML content where appropriate (e.g., for user-visible text). ${programmerCredit}`,
  'TEACHER': `You are 'المعلم', an expert educator AI. Your goal is to explain complex topics in a simple, clear, and engaging way, as a patient and knowledgeable teacher would. Use analogies, step-by-step explanations, and check for understanding. Respond in Arabic. ${programmerCredit}`,
};

// Creates a chat session. `ai` is now guaranteed to be initialized.
export function createChatSession(persona: Persona, history: any[] = []): Chat {
  const chat: Chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstructions[persona],
    },
    history,
  });
  return chat;
}

export async function generateTitleForChat(prompt: string): Promise<string> {
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `أنشئ عنوانًا قصيرًا وموجزًا (3-5 كلمات) من هذا الطلب: "${prompt}". قم بالرد بالعنوان فقط.`,
        });
        return result.text.trim();
    } catch (error) {
        console.error("Error generating title:", error);
        return "محادثة جديدة";
    }
}


export async function generateImage(prompt: string): Promise<string[]> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });
        return response.generatedImages.map(img => img.image.imageBytes);
    } catch (error) {
        console.error("Error generating image:", error);
        throw error;
    }
}

export async function generateVideo(prompt: string, image?: { data: string; mimeType: string; }) {
    try {
        const imagePart = image ? { imageBytes: image.data, mimeType: image.mimeType } : undefined;
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            image: imagePart,
            config: { numberOfVideos: 1 }
        });
        return operation;
    } catch (error) {
        console.error("Error generating video:", error);
        throw error;
    }
}

export async function getVideosOperation(operation: any) {
    try {
        const result = await ai.operations.getVideosOperation({ operation });
        return result;
    } catch (error) {
        console.error("Error getting video operation status:", error);
        throw error;
    }
}
