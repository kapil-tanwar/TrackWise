import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini API client
// The GEMINI_API_KEY environment variable must be set in .env.local
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default ai;
