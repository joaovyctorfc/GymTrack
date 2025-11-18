import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Local history state to manage conversation context
let chatHistory: { role: string; parts: { text: string }[] }[] = [];

const getAIClient = () => {
  // Using the process.env.API_KEY as mandated
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const initializeChat = async () => {
  // Reset history when entering the view
  chatHistory = [];
};

export const sendMessageToCoach = async function* (message: string) {
  const ai = getAIClient();
  
  // Construct the new user message
  const userMessage = { role: 'user', parts: [{ text: message }] };
  
  // Create the full history payload including the new message
  const historyPayload = [...chatHistory, userMessage];

  try {
    const result = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: historyPayload as any, 
      config: {
        systemInstruction: `Você é o IronCoach, um treinador de elite de força e condicionamento físico. 
      Seu objetivo é ajudar os usuários com suas rotinas de treino, dicas de execução e conselhos nutricionais.
      Seja conciso, motivador e baseie-se em dados. 
      Responda sempre em Português do Brasil.
      Se o usuário pedir uma rotina, formate-a de forma limpa com marcadores (bullet points).
      Priorize sempre a segurança.`,
      }
    });

    let fullResponse = "";
    for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            fullResponse += c.text;
            yield c.text;
        }
    }

    // Only update local history state if the request was successful
    chatHistory.push(userMessage);
    chatHistory.push({ role: 'model', parts: [{ text: fullResponse }] });

  } catch (error) {
    console.error("Gemini API Error:", error);
    yield "Estou com problemas para conectar ao servidor agora. Por favor, verifique sua conexão ou tente novamente mais tarde.";
  }
};

export const analyzeWorkout = async (workoutJson: string): Promise<string> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analise este JSON de treino. Forneça 3 dicas principais curtas, diretas e motivadoras sobre o desempenho ou recuperação. Responda em Português do Brasil. NÃO use introduções como "Aqui estão as dicas". Apenas liste as 3 frases separadas por quebra de linha. JSON: ${workoutJson}`
        });
        return response.text || "Ótimo treino! Mantenha a consistência.";
    } catch (error) {
        console.error("Analysis failed", error);
        return "Grande esforço registrado!";
    }
};