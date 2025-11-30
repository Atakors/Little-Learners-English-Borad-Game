import { GoogleGenAI, Modality } from "@google/genai";
import { TileData } from "../types";

let ai: GoogleGenAI | null = null;

// Initialize the client.
// In a real app, you might want to lazily init this or handle errors if the key is missing.
if (process.env.API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} else {
  console.warn("API_KEY is missing. AI features will be disabled.");
}

export const validateAnswer = async (task: TileData, userAnswer: string): Promise<{ isCorrect: boolean; feedback: string }> => {
  if (!ai) return { isCorrect: true, feedback: "AI unavailable. Good job!" };

  try {
    const prompt = `
      You are a friendly English teacher for children.
      Task Category: ${task.category}
      Task Description: ${task.description}
      Specific Instructions: ${task.prompt || "Check if the answer is correct."}
      
      The student answered: "${userAnswer}"
      
      Please evaluate the answer. 
      Return a JSON object with:
      - "isCorrect": boolean (true if the answer satisfies the task, false otherwise)
      - "feedback": string (A short, encouraging sentence explaining why it's correct or how to improve. Keep it simple for kids.)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text);
    return {
      isCorrect: result.isCorrect,
      feedback: result.feedback
    };

  } catch (error) {
    console.error("Gemini validation error:", error);
    return { isCorrect: true, feedback: "I couldn't check that properly, but let's assume you did great!" };
  }
};

export const generateSpeech = async (text: string): Promise<AudioBuffer | null> => {
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await decodeAudioData(base64Audio, audioContext);
    return audioBuffer;

  } catch (error) {
    console.error("Gemini TTS error:", error);
    return null;
  }
};

export const generateTileImage = async (title: string, description: string): Promise<string | null> => {
    if (!ai) return null;

    try {
        const prompt = `Draw a watercolor style, cartoonish, and cute illustration for a children's board game tile. 
        The subject is: "${title} - ${description}".
        The image should be simple, clear, colorful, and on a white background.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }]
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;

    } catch (error) {
        console.error("Gemini Image Generation error:", error);
        return null;
    }
}

// Helper to decode the raw base64 PCM data from Gemini
async function decodeAudioData(base64: string, audioContext: AudioContext): Promise<AudioBuffer> {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // Gemini TTS returns raw PCM. 
    // Usually 24kHz mono (check docs, sometimes requires specific handling).
    const sampleRate = 24000;
    const dataInt16 = new Int16Array(bytes.buffer);
    const frameCount = dataInt16.length;
    const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    
    return buffer;
}

export const playAudioBuffer = (buffer: AudioBuffer) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
}