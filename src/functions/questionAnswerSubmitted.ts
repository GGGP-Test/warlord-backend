import { db, fns } from '../config/firebase';
import { logger } from '../utils/logger';
import { OnboardingAnswer } from '../types/onboarding';
import { generateOnboardingLLMResponse } from '../services/llm';

const EARLY_QUESTION_IDS = ['q1', 'q2', 'q3', 'q4', 'q5'];
const MIDDLE_QUESTION_IDS = ['q6', 'q7', 'q8', 'q9'];

export const questionAnswerSubmitted = fns.firestore
  .document('suppliers/{supplierId}/onboarding_answers/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data() as OnboardingAnswer;
    const { supplierId } = context.params;

    logger.info('Onboarding answer received', {
      supplierId,
      questionId: data.questionId,
    });

    try {
      if (EARLY_QUESTION_IDS.includes(data.questionId)) {
        await processEarlyQuestion(supplierId, snap.id, data);
      } else if (MIDDLE_QUESTION_IDS.includes(data.questionId)) {
        await processMiddleQuestion(supplierId, snap.id, data);
      } else {
        await processLateQuestion(supplierId, snap.id, data);
      }
    } catch (err) {
      logger.error('Error processing onboarding answer', {
        supplierId,
        questionId: data.questionId,
        err,
      });

      await snap.ref.update({ status: 'error' });
    }
  });

async function processEarlyQuestion(
  supplierId: string,
  docId: string,
  answer: OnboardingAnswer
) {
  // BLOCKING: full LLM response + kickoff async jobs
  const prompt = buildPromptForQuestion(answer);
  const { text } = await generateOnboardingLLMResponse(prompt);

  await db
    .doc(`suppliers/${supplierId}/onboarding_answers/${docId}`)
    .update({
      aiResponse: text,
      responseGeneratedAt: new Date(),
      status: 'processed',
    });

  // TODO: fire async confidence scoring + external data checks via Pub/Sub or separate function
}

async function processMiddleQuestion(
  supplierId: string,
  docId: string,
  answer: OnboardingAnswer
) {
  // ASYNC: fire-and-forget scoring, quick LLM if needed
  const prompt = buildPromptForQuestion(answer);
  const { text } = await generateOnboardingLLMResponse(prompt, {
    maxTokens: 200,
  });

  await db
    .doc(`suppliers/${supplierId}/onboarding_answers/${docId}`)
    .update({
      aiResponse: text,
      responseGeneratedAt: new Date(),
      status: 'processed',
    });

  // TODO: fire async jobs
}

async function processLateQuestion(
  supplierId: string,
  docId: string,
  answer: OnboardingAnswer
) {
  // Minimal processing, mostly for data capture
  await db
    .doc(`suppliers/${supplierId}/onboarding_answers/${docId}`)
    .update({ status: 'processed' });

  // TODO: fire async jobs if needed
}

function buildPromptForQuestion(answer: OnboardingAnswer): string {
  return `The supplier answered the onboarding question ${answer.questionId}.

Answer type: ${answer.answerType}
Answer value: ${JSON.stringify(answer.answer)}

Write a short, 1-2 sentence response acknowledging their answer and guiding them to the next step of onboarding. Do not promise specific results or give legal/financial advice.`;
}
