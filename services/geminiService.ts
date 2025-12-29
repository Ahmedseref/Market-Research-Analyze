
import { GoogleGenAI } from "@google/genai";
import type { AnalysisReportData, Source } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generatePrompt = (productDescription: string): string => `
You are an expert AI product analyst. Your primary function is to generate a detailed market research report for a given product, using real-time data from Google Search and Google Maps.

Your response MUST be a single JSON object enclosed in a \`\`\`json code block.

The JSON object must conform to the following structure:
{
  "productName": "string",
  "marketNeed": [
    {
      "region": "string",
      "interestLevel": "string (e.g., 'High Interest', 'Emerging')",
      "score": number (0-100 based on search volume/trends),
      "notes": "string"
    }
  ],
  "demandLevel": {
    "level": "string",
    "justification": "string"
  },
  "priceAnalysis": [
    {
      "region": "string",
      "averagePriceRange": "string"
    }
  ],
  "targetCustomers": [
    {
      "segment": "string",
      "attractiveness": "string"
    }
  ],
  "competitorAnalysis": {
    "keyCompetitors": [
      {
        "name": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "location": "string",
        "website": "string",
        "email": "string",
        "tags": ["string"],
        "revenueUSD": "string",
        "employeeCount": "string (e.g. '50-100', '1,200+')",
        "socialLinks": [
           { "platform": "string (e.g. LinkedIn, Twitter, Facebook)", "url": "string" }
        ],
        "mapUri": "string (optional URI if found)"
      }
    ],
    "competitiveLandscape": "string"
  },
  "strategicSummary": {
    "bestRegion": "string",
    "mostProfitableCustomer": "string",
    "recommendedStrategy": "string"
  }
}

Important for Competitors:
- Use Google Maps and Search to find real companies.
- Include physical headquarters location.
- Include estimated annual revenue and employee count if available.
- Look for official social media profiles (LinkedIn, X, Facebook, Instagram).
- Find official websites and contact emails.

Important for Market Need:
- Provide a quantitative 'score' from 0-100 representing market saturation or search trend intensity.

Now, analyze the market for the following product: "${productDescription}"
`;

const parseJsonResponse = (responseText: string): AnalysisReportData => {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = responseText.match(jsonRegex);
    if (!match || !match[1]) throw new Error("Invalid response format.");
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      throw new Error("Failed to parse analysis data.");
    }
};

const getCurrentPosition = (): Promise<{latitude: number, longitude: number} | undefined> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(undefined);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(undefined),
      { timeout: 5000 }
    );
  });
};

export const analyzeProduct = async (productDescription: string): Promise<{ reportData: AnalysisReportData, sources: Source[] }> => {
    try {
        const coords = await getCurrentPosition();
        
        // Maps grounding is only supported in Gemini 2.5 series models.
        // Using 'gemini-2.5-flash' which is the correct model for Maps grounding.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: generatePrompt(productDescription),
            config: {
                tools: [{ googleSearch: {} }, { googleMaps: {} }],
                ...(coords && {
                  toolConfig: {
                    retrievalConfig: {
                      latLng: coords
                    }
                  }
                })
            },
        });
        
        const reportData = parseJsonResponse(response.text);

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources: Source[] = groundingChunks
            ? groundingChunks
                .map(chunk => {
                  if (chunk.web) return { uri: chunk.web.uri, title: chunk.web.title };
                  if (chunk.maps) return { uri: chunk.maps.uri, title: chunk.maps.title };
                  return null;
                })
                .filter((s): s is Source => s !== null)
            : [];

        if (groundingChunks) {
          reportData.competitorAnalysis.keyCompetitors = reportData.competitorAnalysis.keyCompetitors.map(comp => {
            const mapMatch = groundingChunks.find(c => c.maps && c.maps.title.toLowerCase().includes(comp.name.toLowerCase()));
            if (mapMatch && mapMatch.maps) {
              return { ...comp, mapUri: mapMatch.maps.uri };
            }
            return comp;
          });
        }

        return { reportData, sources };
    } catch (error) {
        console.error("Error in analyzeProduct:", error);
        throw new Error(error instanceof Error ? error.message : "Analysis failed.");
    }
};
