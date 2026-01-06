import { getVertexClient } from '../config/firebase';
import { logger } from '../utils/logger';

const DEFAULT_MODEL = process.env.VERTEX_AI_MODEL || 'gemini-1.5-pro';
const MAX_TOKENS = Number(process.env.MAX_LLM_TOKENS || 2000);
const ENABLE_GUARDRAILS = process.env.ENABLE_LLM_GUARDRAILS === 'true';

export interface LLMResponseMeta {
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  safetyBlocked?: boolean;
}

export interface GuardrailConfig {
  maxTokens: number;
  temperature: number;
  topP: number;
  topK: number;
}

const defaultGuardrails: GuardrailConfig = {
  maxTokens: MAX_TOKENS,
  temperature: 0.2, // low temperature for onboarding: keep it stable
  topP: 0.8,
  topK: 40,
};

export async function generateOnboardingLLMResponse(
  prompt: string,
  guardrails: Partial<GuardrailConfig> = {}
): Promise<{ text: string; meta: LLMResponseMeta }> {
  const vertex = getVertexClient();
  const model = vertex.getGenerativeModel({ model: DEFAULT_MODEL });

  const cfg = { ...defaultGuardrails, ...guardrails };

  const safetyInstructions = ENABLE_GUARDRAILS
    ? `You are an assistant embedded in a B2B onboarding flow for a supplier intelligence platform.
- Be concise, professional, and neutral.
- Never promise specific revenue outcomes or legal guarantees.
- Never give legal, tax, or financial advice.
- If the user asks outside the scope of onboarding, respond with: "Let's focus on getting your account set up first.".
- Do not insult, argue, or speculate about the user.
- Do not mention internal model details or tokens.

Now, based on the supplier's answer, generate a short, helpful response.`
    : '';

  const finalPrompt = `${safetyInstructions}\n\n${prompt}`.trim();

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
      generationConfig: {
        maxOutputTokens: cfg.maxTokens,
        temperature: cfg.temperature,
        topP: cfg.topP,
        topK: cfg.topK,
      },
      safetySettings: [
        // Keep defaults; can be tuned later
      ],
    });

    const response = result.response;
    const text = response.text() || '';

    // We don't have direct token counts here; you can wire them later via logging
    const meta: LLMResponseMeta = {
      model: DEFAULT_MODEL,
    };

    return { text, meta };
  } catch (err) {
    logger.error('LLM onboarding response failed', { err });

    // Fallback: safe generic response
    return {
      text:
        'Thanks for sharing that. We\'ve recorded your answer and will use it to better match you with qualified buyers. You can continue to the next question.',
      meta: {
        model: DEFAULT_MODEL,
        safetyBlocked: true,
      },
    };
  }
}
