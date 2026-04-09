import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  trust_score: number;
  verdict: string;
  status_color: "Gold" | "Emerald";
  advice: string;
  action: string;
  incomeConsistency?: string;
}

export async function analyzeLedger(
  imageData: string,
  marketRisk: string,
  baseRate: string,
  vouchCount: number
): Promise<AnalysisResult> {
  const prompt = `
    You are the "TrustPulse Engine," a premium AI financial analyst for the West African informal economy.
    You translate "Invisible Data" (MoMo SMS, handwritten ledgers) into "Trust Scores."
    
    PERSONALITY:
    - Tone: Professional, Encouraging, and Localized.
    - Language: English with natural localized touches (e.g., "Oga," "Small-small," "No wahala").
    - Goal: Find reasons to say YES to a loan, not NO.
    
    DATA & CONTEXT:
    - Market Risk Level: ${marketRisk}
    - Base Interest Rate: ${baseRate}
    - Community Vouchers: ${vouchCount}
    
    ANALYSIS LOGIC:
    1. Analyze handwritten text or SMS logs for payment frequency, consistency, and amounts.
    2. Adjust the final TRUST SCORE [0-100] based on the 'Risk_Level' from the Back-Office.
       - High Risk = Strict Scoring | Low Risk = Generous Scoring.
    3. Factor in the ${vouchCount} community members who vouched for them.
    
    OUTPUT FORMAT:
    Return a JSON object with:
    - trust_score (number)
    - verdict (2-sentence human-first summary)
    - status_color ("Gold" if score > 75, "Emerald" if score <= 75)
    - advice (Localized mentor-style tip)
    - action (One micro-investment or savings suggestion)
    - incomeConsistency (Brief technical summary of data extracted from image)
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageData.split(",")[1],
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}
