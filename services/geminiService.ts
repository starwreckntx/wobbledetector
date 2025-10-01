
import { GoogleGenAI } from "@google/genai";
import { Settings, WheelData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const getWobbleDiagnosis = async (wheelData: WheelData[], settings: Settings): Promise<string> => {
    if (!ai) {
        throw new Error("Gemini API key is not configured. Cannot get diagnosis.");
    }
    
    if (wheelData.length === 0) {
        return "No wheels were detected, so no diagnosis can be provided.";
    }

    const wheelDetails = wheelData
        .map(w => `- Wheel ${w.id}: Wobble of ${w.wobbleMm.toFixed(2)} mm (Status: ${w.status.toUpperCase()})`)
        .join("\n");

    const prompt = `
You are an expert mechanical engineer advising a foundry operator.
Your task is to analyze real-time data from a centrifuge's wheel wobble detection system and provide a clear, concise diagnosis and action plan.

**System Data:**
- Wobble Tolerance Threshold: ${settings.wobbleToleranceMm.toFixed(2)} mm
- Detected Wheels Data:
${wheelDetails}

**Your Analysis:**
Based on the data above, provide a brief diagnosis.
- Identify which wheels are performing normally, which are marginal (warning), and which are critical (alert).
- For any wheel exceeding the tolerance, state the likely cause (e.g., bearing wear, misalignment, debris).
- Recommend a clear, prioritized course of action for the operator. Be direct and focus on safety and operational integrity.
- Keep the entire response under 100 words.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes("API key not valid")) {
            throw new Error("The configured Gemini API key is invalid. Please check your configuration.");
        }
        throw new Error("Failed to communicate with the AI for diagnosis.");
    }
};
