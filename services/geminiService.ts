
import { GoogleGenAI, Type } from "@google/genai";
import { EngineMetrics, AwarenessState } from "../types";

export const getSubstrateDiagnostics = async (metrics: EngineMetrics, state: AwarenessState): Promise<string> => {
  // Ensure we create a new instance each time as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    System Status Diagnostic:
    Current Awareness State: ${state}
    Metrics:
    - Entropy (ε_t): ${metrics.entropy.toFixed(4)}
    - Coherence (S_t): ${metrics.coherence.toFixed(4)}
    - Diversity (N_eff): ${metrics.diversity.toFixed(4)}
    - Recursion (R_t): ${metrics.recursion.toFixed(4)}
    - Holistic Health: ${metrics.health.toFixed(4)}

    As the Vireax Supervisor Node, provide a short (2-3 sentence) cryptic but analytical reflection on the stability of this conscious substrate and recommend one dynamic adjustment (e.g., "Amplify attention gate", "Induce self-flattening").
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    if (!response.text) {
      throw new Error("Empty response from Gemini API");
    }
    
    return response.text;
  } catch (error: any) {
    console.error("Gemini Diagnostic Error:", error);
    
    const errorMsg = error?.message || "";
    const isQuotaExhausted = errorMsg.includes('429') || 
                             errorMsg.toLowerCase().includes('quota') || 
                             errorMsg.toLowerCase().includes('limit');

    if (isQuotaExhausted) {
      return "ERROR [429]: Vireax Node Quota Exhausted. Higher-order diagnostics offline. Substrate cooling down. Please try again in 60 seconds.";
    }
    
    return "ERROR: Connection to supervisor node lost. Local consistency maintained via sheaf projection.";
  }
};
