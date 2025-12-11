import { GoogleGenAI, Type } from "@google/genai";
import { LaunchSite, AnalysisResult } from "../types";

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

const parseAIResponse = (text: string): AnalysisResult | null => {
  try {
    // Basic cleanup if the model adds markdown code blocks despite schema
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr) as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return null;
  }
};

export const analyzeLaunch = async (
  site: LaunchSite,
  rocket: string,
  targetLat?: number,
  targetLng?: number,
  notamText?: string
): Promise<AnalysisResult | null> => {
  if (!API_KEY) {
    console.error("API Key missing. Set GEMINI_API_KEY in your environment.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    Analyze a rocket launch from ${site.name} (${site.country}) using a ${rocket} rocket.
    Coordinates of launch: ${site.lat}, ${site.lng}.
    
    ${targetLat && targetLng ? `The rocket is heading towards or has a trajectory passing near Lat: ${targetLat}, Lng: ${targetLng}.` : ''}
    ${notamText ? `Consider this NOTAM text for danger zones: ${notamText}` : 'Predict standard danger zones for spent stages.'}
    
    Calculate:
    1. A realistic trajectory path (array of points) starting at the launch site, passing through typical drop zones, and potentially passing near Thailand.
    2. Identify Danger Zones (rectangles) where stages might fall.
    3. Determine if this path intersects with Thailand airspace.
    4. Number of stages for this rocket.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      trajectory: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER },
            altitude: { type: Type.NUMBER }
          }
        }
      },
      dangerZones: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            lat: { type: Type.NUMBER, description: "Center Latitude" },
            lng: { type: Type.NUMBER, description: "Center Longitude" },
            width: { type: Type.NUMBER, description: "Width in degrees" },
            height: { type: Type.NUMBER, description: "Height in degrees" },
            description: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['stage1', 'stage2', 'fairing', 'reentry'] }
          }
        }
      },
      stages: { type: Type.INTEGER },
      passesThailand: { type: Type.BOOLEAN },
      notes: { type: Type.STRING }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2
      }
    });

    return parseAIResponse(response.text);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
};

export const searchNextSpaceflightSimulated = async (query: string): Promise<any[]> => {
    // Simulating a search via Gemini since we can't scrape NextSpaceflight directly in browser
    if (!API_KEY) return [];

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Generate a realistic JSON list of 3 upcoming or recent rocket launches based on the query: "${query}". 
    Focus on China (CASC) or India (ISRO) missions if unspecified.
    Include fields: mission (string), rocket (string), siteId (one of: jiuquan, xichang, taiyuan, wenchang, sdsc, terls), date (string YYYY-MM-DD).`;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                mission: { type: Type.STRING },
                rocket: { type: Type.STRING },
                siteId: { type: Type.STRING },
                date: { type: Type.STRING }
            }
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (e) {
        return [];
    }
}