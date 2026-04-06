
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProgramWithAI = async (goal: string, frequency: string, level: string) => {
  const prompt = `Generate a physical training program for ${goal}. 
  Frequency: ${frequency} workouts per week. 
  Level: ${level}. 
  Format the response as a JSON object matching the training program structure.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          durationWeeks: { type: Type.NUMBER },
          workouts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                day: { type: Type.STRING },
                exercises: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      sets: { type: Type.NUMBER },
                      reps: { type: Type.STRING },
                      rest: { type: Type.STRING },
                      notes: { type: Type.STRING }
                    },
                    required: ["name", "sets", "reps"]
                  }
                }
              },
              required: ["title", "day", "exercises"]
            }
          }
        },
        required: ["title", "description", "workouts"]
      }
    }
  });

  return JSON.parse(response.text);
};
