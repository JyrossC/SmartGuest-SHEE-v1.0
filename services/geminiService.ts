
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { MENU_ITEMS, SYSTEM_INSTRUCTION_CONCIERGE, SYSTEM_INSTRUCTION_FITNESS, SYSTEM_INSTRUCTION_NUTRITION, SYSTEM_INSTRUCTION_SPA, SPA_TREATMENTS } from "../constants";
import { UserProfile } from "../types";

// NOTE: In a production app, this should be a backend call to hide the key.
// For this demo, we assume the environment variable is available.
const API_KEY = process.env.API_KEY || ''; 

// Helper to get fresh client (useful for Veo key updates)
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || API_KEY });

// 1. AI Nutritionist Recommendation
export const getNutritionRecommendation = async (user: UserProfile) => {
  try {
    const ai = getAiClient();
    const menuContext = JSON.stringify(MENU_ITEMS.map(item => ({
      name: item.name,
      description: item.description,
      calories: item.calories,
      tags: item.tags,
      id: item.id
    })));

    const prompt = `
      Guest Profile:
      Name: ${user.name}
      Goal: ${user.healthGoal}
      Restrictions: ${user.dietaryRestrictions.join(', ')}
      Mood: ${user.mood}

      Available Menu (JSON):
      ${menuContext}

      Please recommend a specific 3-course meal (Starter, Main, Drink) strictly from the Available Menu provided that helps achieve their goal.
      
      Return ONLY a valid JSON object with this structure:
      {
        "reasoning": "A persuasive, elegant paragraph explaining WHY this specific combination was chosen for their health goal.",
        "recommendedItemIds": ["id_of_starter", "id_of_main", "id_of_drink"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_NUTRITION,
        responseMimeType: 'application/json'
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Nutrition AI Error:", error);
    return {
        reasoning: "Our AI Nutritionist is currently consulting with the chef. Please browse the menu below.",
        recommendedItemIds: []
    };
  }
};

// 2. Smart Pairing (Drink Recommendation)
export const getSmartPairing = async (foodName: string, user: UserProfile) => {
  try {
    const ai = getAiClient();
    // Pass structured data so AI knows IDs
    const drinks = MENU_ITEMS.filter(i => i.category === 'Drink').map(d => ({
        id: d.id,
        name: d.name,
        description: d.description
    }));
    
    const drinksContext = JSON.stringify(drinks);
    
    const prompt = `
      You are an elite Sommelier & Wellness Consultant.
      
      Guest Profile:
      - Name: ${user.name}
      - Goal: ${user.healthGoal}
      
      Guest ordered: "${foodName}".
      
      Available Drinks (JSON): ${drinksContext}
      
      Recommend ONE drink from the list that pairs with the food and supports their goal.
      
      Return JSON:
      {
        "recommendationText": "Sophisticated reasoning (max 2 sentences).",
        "recommendedDrinkId": "id of the drink"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });
    
    const result = JSON.parse(response.text);
    return {
        text: result.recommendationText,
        drinkId: result.recommendedDrinkId
    };
  } catch (error) {
    console.error("Pairing Error", error);
    // Fallback to water if AI fails
    return { 
        text: "A refreshing mineral water is always a pristine choice for hydration.", 
        drinkId: 'd1' 
    };
  }
};

// 3. AI Gym Trainer
export const getWorkoutPlan = async (user: UserProfile, location: string) => {
  try {
    const ai = getAiClient();
    const prompt = `
      Create a detailed workout session.
      Guest Profile:
      - Age: ${user.age || 'Not specified'}
      - Fitness Level: ${user.fitnessLevel || 'Not specified'}
      - Goal: ${user.healthGoal}
      - Medical Conditions/Injuries: ${user.medicalConditions ? user.medicalConditions.join(', ') : 'None'}
      - Current Mood: ${user.mood}
      
      Location Context: ${location}

      Return a JSON object with this structure:
      {
        "title": "Workout Title",
        "totalDuration": "45 min",
        "exercises": [
          {
            "name": "Exercise Name",
            "duration": "number of seconds",
            "reps": "e.g. 12-15 or 'Until Failure'",
            "sets": "e.g. 3",
            "instructions": "Brief coaching cue",
            "tip": "AI Sentinel technical correction tailored to their medical/fitness context"
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_FITNESS,
        responseMimeType: 'application/json'
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Fitness AI Error:", error);
    return null;
  }
};

// 4. Concierge with Search & Maps Grounding
export const getConciergeResponse = async (query: string, userLocation: string = "Zanzibar") => {
  try {
    const ai = getAiClient();
    
    // We modify the prompt to ask for structured data if recommendations are involved
    const prompt = `
      User asks: "${query}". 
      The user is currently in ${userLocation}.
      
      If the user is asking for recommendations (places, tours, activities), provide a polite text response AND a JSON array of specific suggestions at the end of your response wrapped in \`\`\`json \`\`\` blocks.
      
      The JSON structure for suggestions should be:
      [
        {
          "title": "Name of Place/Activity",
          "time": "Suggested Time (e.g. 09:00 AM or Sunset)",
          "location": "Specific Location Name",
          "description": "Brief reason to go",
          "mapQuery": "Query to find this on Google Maps"
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using 2.5 Flash for Google Maps Support
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }], // Enable Maps Grounding
        systemInstruction: SYSTEM_INSTRUCTION_CONCIERGE
      }
    });
    
    return {
      text: response.text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Concierge Error:", error);
    return { text: "I apologize, I cannot access external information right now." };
  }
};

// 5. Spa Symptom Matching
export const getSpaRecommendation = async (symptoms: string[]) => {
    try {
        const ai = getAiClient();
        const spaContext = JSON.stringify(SPA_TREATMENTS);
        
        const prompt = `
            Guest Symptoms: ${symptoms.join(', ')}
            Available Treatments (JSON): ${spaContext}
            
            Select the ONE best treatment from the list for these symptoms.
            Return ONLY a valid JSON object with:
            {
                "treatmentId": "id of treatment",
                "reasoning": "brief explanation"
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_SPA,
                responseMimeType: 'application/json'
            }
        });
        
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Spa AI Error:", error);
        return null;
    }
};

// 6. Text to Speech
export const generateSpeech = async (text: string) => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

// 7. Generate Image (Fitness/Visual Guide)
export const generateImage = async (prompt: string) => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};

// 8. Generate Video (Veo)
export const generateTourVideo = async (prompt: string): Promise<string | null> => {
  try {
    // Check for API key selection for Veo
    if ((window as any).aistudio) {
       const hasKey = await (window as any).aistudio.hasSelectedApiKey();
       if (!hasKey) {
         await (window as any).aistudio.openSelectKey();
       }
    }

    const ai = getAiClient();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (videoUri) {
      // Append key for access
      return `${videoUri}&key=${process.env.API_KEY}`;
    }
    return null;
  } catch (error) {
    console.error("Veo Error:", error);
    return null;
  }
};

// 9. Weather Suggestion
export const getWeatherSuggestion = async (weatherData: any, user: UserProfile) => {
  try {
    const ai = getAiClient();
    const prompt = `
      Current Weather in Zanzibar:
      Temperature: ${weatherData.temperature}°C
      Condition: ${weatherData.condition}
      Humidity: ${weatherData.humidity}%
      
      Guest Profile:
      Goal: ${user.healthGoal}
      
      Based on the current weather and the guest's profile, provide one short, sophisticated suggestion (max 15 words) for an activity or comfort measure they should take at the resort right now.
      
      Return JSON:
      {
        "suggestion": "The suggestion text"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Weather AI Error:", error);
    return { suggestion: "Enjoy the tropical breeze in our infinity pool." };
  }
};

// 10. Navigation Compass Guide
export const getNavigationGuide = async (query: string, origin: string) => {
  try {
    const ai = getAiClient();
    const prompt = `
      Current Location: ${origin} (Usually assume context of Zanzibar, Tanzania or a luxury resort context)
      User Objective: ${query}
      
      You are a high-precision Spatial AI Navigator. Provide spatial guidance and landmark-based turn-by-step instructions (max 5 steps).
      Include headings (North, South, East, West) to simulate a digital compass guidance system.
      
      You MUST also provide geographic coordinates (Latitude, Longitude) for the destination and the origin (if recognizable, else use resort defaults).
      
      Return JSON:
      {
        "objective": "Official Name of Destination",
        "category": "Activity/Restaurant/Landmark",
        "rating": number (stars e.g. 4.8),
        "estimatedTime": "15 mins",
        "description": "Brief luxury description",
        "location": {
            "lat": number,
            "lng": number
        },
        "steps": [
          {
            "instruction": "E.g. Head North-West towards the main gate.",
            "landmark": "E.g. Resort Fountain",
            "distance": "100m"
          }
        ],
        "bearing": "A string like 'NW' or 'E' indicating primary direction"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Better for spatial/grounding
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        responseMimeType: 'application/json'
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Navigation AI Error:", error);
    return null;
  }
};
