import { GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || Constants.expoConfig?.extra?.geminiApiKey || '';

export async function extractReceiptData(base64Image: string) {
  if (!apiKey) {
    console.warn("No Gemini API key found. Returning mock data.");
    return { merchant: "Mock Coffee Shop", amount: 12.50, date: new Date().toISOString() };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "Analyze this receipt. Return ONLY a raw JSON object with the following keys: 'merchant' (string, the name of the store), 'amount' (number, the final total cost), and 'date' (string, ISO format if available). Do not include markdown code blocks or any other text.";
    
    const image = {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg"
      },
    };

    const result = await model.generateContent([prompt, image]);
    const responseText = result.response.text();
    
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error with AI API:", error);
    return null;
  }
}
