import * as express from 'express';
import * as admin from 'firebase-admin';
import {
  saveOnboardingAnswer,
  getAllOnboardingAnswers,
  getSupplierRecord,
  updateOnboardingStatus,
  getOnboardingProgress,
} from './firestore-client';
import {
  getQ1Response,
  getQ2Response,
  getQ3Response,
  getQ6Response,
  getQ7Response,
  getQ9Response,
  getQ10Response,
  getDefaultResponse,
} from './research-responses';

const router = express.Router();

// ============================================
// QUESTION DEFINITIONS
// ============================================

const ONBOARDING_QUESTIONS = [
  {
    id: 'q1',
    number: 1,
    title: 'What is your primary product?',
    description: 'What type of secondary packaging do you manufacture?',
    answerType: 'choice',
    choices: ['boxes', 'film', 'laminates', 'labels', 'other'],
    hasAIResponse: true,
  },
  {
    id: 'q2',
    number: 2,
    title: 'When was your business founded?',
    description: 'What year did your company start operations?',
    answerType: 'year',
    hasAIResponse: true,
  },
  {
    id: 'q3',
    number: 3,
    title: 'How many active customers do you have?',
    description: 'Approximately how many unique customers do you invoice monthly?',
    answerType: 'choice',
    choices: ['low_volume', 'medium_volume', 'high_volume'],
    hasAIResponse: true,
  },
  {
    id: 'q4',
    number: 4,
    title: 'What percentage of revenue comes from your top 3 customers?',
    description: 'What is your customer concentration? (0-100%)',
    answerType: 'number',
    hasAIResponse: false,
  },
  {
    id: 'q5',
    number: 5,
    title: 'What is your annual revenue?',
    description: 'Approximate annual revenue?',
    answerType: 'choice',
    choices: ['under_500k', '500k_1m', '1m_3m', '3m_5m', '5m_10m', 'over_10m'],
    hasAIResponse: false,
  },
  {
    id: 'q6',
    number: 6,
    title: 'What is your biggest pain point?',
    description: 'What is holding back your growth the most?',
    answerType: 'choice',
    choices: ['finding_buyers', 'margins', 'operational', 'retention'],
    hasAIResponse: true,
  },
  {
    id: 'q7',
    number: 7,
    title: 'What sales methods have you tried?',
    description: 'Select all that apply',
    answerType: 'array',
    choices: ['cold_calling', 'email', 'linkedin', 'events', 'referrals', 'other'],
    hasAIResponse: true,
  },
  {
    id: 'q8',
    number: 8,
    title: 'How many outreach attempts per month?',
    description: 'How many conversations do you initiate with prospects monthly?',
    answerType: 'number',
    hasAIResponse: false,
  },
  {
    id: 'q9',
    number: 9,
    title: 'How many customers do you close per month?',
    description: 'Average number of new customers per month',
    answerType: 'number',
    hasAIResponse: true,
  },
  {
    id: 'q10',
    number: 10,
    title: 'What is your close rate?',
    description: 'Percentage of conversations that result in a sale (e.g., 0.15 for 15%)',
    answerType: 'number',
    hasAIResponse: true,
  },
  {
    id: 'q11',
    number: 11,
    title: 'How are you addressing your main pain?',
    description: 'What approaches are you trying?',
    answerType: 'choice',
    choices: ['data_driven', 'networking', 'marketing', 'operational', 'other'],
    hasAIResponse: false,
  },
  {
    id: 'q12',
    number: 12,
    title: 'What methods have NOT worked?',
    description: 'Select all that have failed',
    answerType: 'array',
    choices: ['cold_calling', 'email', 'linkedin', 'events', 'referrals', 'marketing'],
    hasAIResponse: false,
  },
  {
    id: 'q13',
    number: 13,
    title: 'What is your operational maturity?',
    description: 'How established is your production and fulfillment?',
    answerType: 'choice',
    choices: ['high', 'medium', 'lower'],
    hasAIResponse: true,
  },
  {
    id: 'q14',
    number: 14,
    title: 'What is your tech stack?',
    description: 'What systems do you use for operations?',
    answerType: 'text',
    hasAIResponse: false,
  },
  {
    id: 'q15',
    number: 15,
    title: 'What is your API capability?',
    description: 'Can you integrate with external systems via APIs?',
    answerType: 'choice',
    choices: ['yes_easy', 'yes_with_dev', 'limited', 'no'],
    hasAIResponse: false,
  },
  {
    id: 'q16',
    number: 16,
    title: 'What is your order frequency?',
    description: 'How often do existing customers order?',
    answerType: 'choice',
    choices: ['daily', 'weekly', 'monthly', 'quarterly', 'varied'],
    hasAIResponse: false,
  },
  {
    id: 'q17',
    number: 17,
    title: 'What is your lead time flexibility?',
    description: 'How quickly can you fulfill custom orders?',
    answerType: 'choice',
    choices: ['1_week', '2_3_weeks', '1_month', '2_3_months', 'varies'],
    hasAIResponse: false,
  },
];

// ============================================
// ROUTE: GET ALL QUESTIONS
// ============================================

router.get('/questions', (req: express.Request, res: express.Response) => {
  try {
    res.json({
      success: true,
      totalQuestions: ONBOARDING_QUESTIONS.length,
      questions: ONBOARDING_QUESTIONS,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions',
    });
  }
});

// ============================================
// ROUTE: SUBMIT ANSWER
// ============================================

router.post(
  '/submit-answer',
  async (req: express.Request, res: express.Response) => {
    try {
      const { supplierId, questionId, answer, answerType } = req.body;

      // Validation
      if (!supplierId || !questionId || answer === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: supplierId, questionId, answer',
        });
      }

      // Find question metadata
      const question = ONBOARDING_QUESTIONS.find((q) => q.id === questionId);
      if (!question) {
        return res.status(400).json({
          success: false,
          error: `Question ${questionId} not found`,
        });
      }

      // Generate AI response if this question has one
      let aiResponse: string | undefined;
      const paidTierEnabled = process.env.PAID_TIER_ENABLED === 'true';

      if (question.hasAIResponse && !paidTierEnabled) {
        // Use research-based responses
        switch (questionId) {
          case 'q1':
            aiResponse = getQ1Response(String(answer)).response;
            break;
          case 'q2':
            aiResponse = getQ2Response(answer).response;
            break;
          case 'q3':
            aiResponse = getQ3Response(String(answer)).response;
            break;
          case 'q6':
            aiResponse = getQ6Response(String(answer)).response;
            break;
          case 'q7':
            aiResponse = getQ7Response(Array.isArray(answer) ? answer : [String(answer)]).response;
            break;
          case 'q9':
            aiResponse = getQ9Response(answer).response;
            break;
          case 'q10':
            aiResponse = getQ10Response(answer).response;
            break;
          default:
            aiResponse = getDefaultResponse(questionId, String(answer)).response;
        }
      }

      // TODO: If paidTierEnabled = true, call Vertex AI here

      // Save to Firestore
      await saveOnboardingAnswer(
        supplierId,
        questionId,
        answer,
        answerType || question.answerType,
        aiResponse
      );

      // Get updated progress
      const progress = await getOnboardingProgress(supplierId);

      // Auto-update onboarding status
      if (progress.percentComplete === 100) {
        await updateOnboardingStatus(supplierId, 'completed');
      } else if (progress.answeredQuestions > 0) {
        await updateOnboardingStatus(supplierId, 'in_progress');
      }

      // Find next unanswered question
      const answers = await getAllOnboardingAnswers(supplierId);
      const nextQuestion = ONBOARDING_QUESTIONS.find((q) => !answers[q.id]);

      res.json({
        success: true,
        questionId,
        aiResponse: aiResponse
          ? {
              response: aiResponse,
              generatedAt: new Date().toISOString(),
              source: paidTierEnabled ? 'vertex_ai' : 'research',
            }
          : null,
        progress: {
          answeredQuestions: progress.answeredQuestions,
          totalQuestions: progress.totalQuestions,
          percentComplete: progress.percentComplete,
          status: progress.status,
        },
        nextQuestion: nextQuestion
          ? {
              id: nextQuestion.id,
              number: nextQuestion.number,
              title: nextQuestion.title,
            }
          : null,
        onboardingComplete: progress.percentComplete === 100,
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit answer',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// ============================================
// ROUTE: GET PROGRESS
// ============================================

router.get(
  '/progress/:supplierId',
  async (req: express.Request, res: express.Response) => {
    try {
      const { supplierId } = req.params;

      const progress = await getOnboardingProgress(supplierId);
      const supplier = await getSupplierRecord(supplierId);

      res.json({
        success: true,
        supplierId,
        progress,
        supplier: supplier ? { email: supplier.email, displayName: supplier.displayName } : null,
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch progress',
      });
    }
  }
);

// ============================================
// ROUTE: GET ALL ANSWERS
// ============================================

router.get(
  '/all-answers/:supplierId',
  async (req: express.Request, res: express.Response) => {
    try {
      const { supplierId } = req.params;

      const answers = await getAllOnboardingAnswers(supplierId);
      const progress = await getOnboardingProgress(supplierId);

      res.json({
        success: true,
        supplierId,
        answers,
        progress,
        totalAnswered: Object.keys(answers).length,
      });
    } catch (error) {
      console.error('Error fetching answers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch answers',
      });
    }
  }
);

// ============================================
// ROUTE: HEALTH CHECK
// ============================================

router.get('/health', (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;