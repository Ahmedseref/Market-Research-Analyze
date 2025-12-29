
import { GoogleGenAI } from "@google/genai";
import type { AnalysisReportData, Source } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generatePrompt = (productDescription: string): string => `
You are an expert AI product analyst. Your primary function is to generate a detailed market research report for a given product, using real-time data from Google Search.

Your response MUST be a single JSON object enclosed in a \`\`\`json code block. Do not include any text, notes, or explanations outside of the JSON block.

The JSON object must conform to the following structure:
{
  "productName": "string",
  "marketNeed": [
    {
      "region": "string",
      "interestLevel": "string (e.g., 'Increasing', 'Stable', 'Decreasing')",
      "notes": "string"
    }
  ],
  "demandLevel": {
    "level": "string ('High', 'Medium', or 'Low')",
    "justification": "string"
  },
  "priceAnalysis": [
    {
      "region": "string",
      "averagePriceRange": "string (e.g., '$5 - $10 USD')"
    }
  ],
  "targetCustomers": [
    {
      "segment": "string (e.g., 'Wholesalers', 'Online Retailers')",
      "attractiveness": "string"
    }
  ],
  "competitorAnalysis": {
    "keyCompetitors": [
      {
        "name": "string",
        "strengths": ["string"],
        "weaknesses": ["string"]
      }
    ],
    "competitiveLandscape": "string (A brief overview of the competitive environment)"
  },
  "strategicSummary": {
    "bestRegion": "string",
    "mostProfitableCustomer": "string",
    "recommendedStrategy": "string"
  }
}

Now, analyze the market for the following product: "${productDescription}"
`;

const parseJsonResponse = (responseText: string): AnalysisReportData => {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = responseText.match(jsonRegex);
  
    if (!match || !match[1]) {
      throw new Error("Invalid response format. Could not find a valid JSON block.");
    }
  
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      console.error("Failed to parse JSON:", match[1]);
      throw new Error("Failed to parse the analysis data from the AI's response.");
    }
};

export const analyzeProduct = async (productDescription: string): Promise<{ reportData: AnalysisReportData, sources: Source[] }> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: generatePrompt(productDescription),
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const responseText = response.text;
        const reportData = parseJsonResponse(responseText);

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources: Source[] = groundingChunks
            ? groundingChunks
                .filter(chunk => chunk.web)
                .map(chunk => ({
                    uri: chunk.web.uri,
                    title: chunk.web.title,
                }))
            : [];

        return { reportData, sources };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`API Error: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while analyzing the product.");
    }
};
