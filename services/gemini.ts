import { GoogleGenAI, Type } from "@google/genai";
import { AiAdvice } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  // In a real app, we'd handle this more gracefully, but for this demo we assume it's present
  // or the call will fail and be caught in the component.
  if (!apiKey) {
    console.warn("API_KEY is missing.");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'dummy_key' });
};

export const analyzeCampaignContent = async (description: string): Promise<AiAdvice> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are a social media growth expert. Analyze this campaign content description: "${description}". 
        Provide strategic advice to maximize engagement.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    suggestedPlatform: { type: Type.STRING, description: "Best platform for this content" },
                    targetAudience: { type: Type.STRING, description: "Description of ideal audience" },
                    hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5 optimal hashtags" },
                    viralityScore: { type: Type.NUMBER, description: "Estimated virality potential 1-10" },
                    reasoning: { type: Type.STRING, description: "Brief explanation of the score and advice" }
                }
            }
        }
    });

    if (response.text) {
        return JSON.parse(response.text) as AiAdvice;
    }
    throw new Error("No response text from Gemini");
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return fallback mock data if API fails (e.g., no key provided in environment)
    return {
        suggestedPlatform: "Instagram",
        targetAudience: "General Audience (Fallback)",
        hashtags: ["#viral", "#fyp", "#trending"],
        viralityScore: 5,
        reasoning: "Could not connect to AI service. Defaulting to generic advice."
    };
  }
};