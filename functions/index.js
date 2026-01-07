/**
 * Main entry point for Cloud Run
 * Starts Express server on port 8080
 */

const express = require('express');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
  });
}

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// FIRESTORE OPERATIONS
// ============================================

const db = admin.firestore();

async function saveOnboardingAnswer(
  supplierId,
  questionId,
  answer,
  answerType,
  aiResponse
) {
  const answerData = {
    questionId,
    answer,
    answerType,
    submittedAt: admin.firestore.Timestamp.now(),
    status: 'received',
    flags: [],
  };

  if (aiResponse) {
    answerData.aiResponse = aiResponse;
    answerData.responseGeneratedAt = admin.firestore.Timestamp.now();
    answerData.status = 'processed';
  }

  await db
    .collection('suppliers')
    .doc(supplierId)
    .collection('onboarding_answers')
    .doc(questionId)
    .set(answerData, { merge: true });

  return true;
}

async function getAllOnboardingAnswers(supplierId) {
  const snapshot = await db
    .collection('suppliers')
    .doc(supplierId)
    .collection('onboarding_answers')
    .get();

  const answers = {};
  snapshot.forEach((doc) => {
    answers[doc.id] = doc.data();
  });

  return answers;
}

async function getOnboardingProgress(supplierId) {
  const answers = await getAllOnboardingAnswers(supplierId);
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = 17;
  const percentComplete = Math.round((answeredCount / totalQuestions) * 100);

  return {
    answeredQuestions: answeredCount,
    totalQuestions,
    percentComplete,
    status: 'in_progress',
  };
}

// ============================================
// RESEARCH RESPONSES
// ============================================

function getQ1Response(answer) {
  const responses = {
    boxes: {
      response: `We see you're in corrugated or folding box manufacturing. This is a highly fragmented market with consolidation happening at regional level. Most box manufacturers have 3-5 primary buyer relationships that account for 60%+ of revenue.\n\nOur platform helps you identify new buyer segments in your geographic zone that haven't been approached yet, using real-time permit data and expansion signals. Box buyers typically show growth signals 30-45 days before they're ready to increase volume.`,
      nextQuestionHint: 'Next, we understand your business maturity and customer base size.',
    },
    film: {
      response: `Film and flexible packaging is a high-margin, fast-moving category. You likely serve both CPG converters and contract manufacturers. The barrier to entry for new customers is usually technical compatibility (machine specifications) and minimum order volumes.\n\nOur platform identifies buyers in your region who are expanding production capacity or adding new SKUs (both require more film). These buyers are in "buying mode" and more receptive to new suppliers.`,
      nextQuestionHint: 'Understanding your business age helps us model your buyer capacity.',
    },
    laminates: {
      response: `Laminate manufacturing serves highly specialized markets (beverage, pharmaceutical, food safety). Buyers are concentrated but sticky once contracted. Most of your business is likely with 10-20 anchor customers.\n\nGrowth comes from: (1) geographic expansion of existing customers, (2) new market segments you haven't served, (3) replacing competitors. Our platform tracks all three signals in your region.`,
      nextQuestionHint: 'Next we understand your business stage and annual capacity.',
    },
    labels: {
      response: `Label manufacturing is high-volume, low-margin, and highly competitive. Differentiation comes from: (1) quick turnaround, (2) custom printing capabilities, (3) being geographically close. You win on convenience and speed, not price.\n\nNew customer acquisition in labels happens through: (1) contract manufacturers adding new products, (2) brands expanding distribution (new SKUs = new labels), (3) replacing underperforming vendors. We identify all three signals in real-time.`,
      nextQuestionHint: 'Understanding your operation scale helps model your buyer capacity.',
    },
    other: {
      response: `Interesting - there are several other secondary packaging segments (bags, pouches, rigid containers, etc.). Whatever your segment, the buying pattern is similar: businesses buy more packaging when they're expanding production, entering new markets, or replacing a current supplier due to service issues.\n\nOur platform helps you identify which buyers in your region are in "expansion mode" right now, using real-time signals like permit filings, hiring, and online activity.`,
      nextQuestionHint: 'Next, we understand your business maturity.',
    },
  };

  return (
    responses[answer] || {
      response: 'Packaging manufacturing is a growth industry. We help you find buyers in expansion mode.',
      nextQuestionHint: 'Let me learn more about your specific situation.',
    }
  );
}

// ============================================
// QUESTIONS DEFINITION
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
    hasAIResponse: false,
  },
  {
    id: 'q3',
    number: 3,
    title: 'How many active customers do you have?',
    description: 'Approximately how many unique customers do you invoice monthly?',
    answerType: 'choice',
    choices: ['low_volume', 'medium_volume', 'high_volume'],
    hasAIResponse: false,
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
    hasAIResponse: false,
  },
  {
    id: 'q7',
    number: 7,
    title: 'What sales methods have you tried?',
    description: 'Select all that apply',
    answerType: 'array',
    choices: ['cold_calling', 'email', 'linkedin', 'events', 'referrals', 'other'],
    hasAIResponse: false,
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
    hasAIResponse: false,
  },
  {
    id: 'q10',
    number: 10,
    title: 'What is your close rate?',
    description: 'Percentage of conversations that result in a sale (e.g., 0.15 for 15%)',
    answerType: 'number',
    hasAIResponse: false,
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
    hasAIResponse: false,
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
// ROUTES
// ============================================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/onboarding/questions', (req, res) => {
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

app.post('/api/onboarding/submit-answer', async (req, res) => {
  try {
    const { supplierId, questionId, answer, answerType } = req.body;

    if (!supplierId || !questionId || answer === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: supplierId, questionId, answer',
      });
    }

    const question = ONBOARDING_QUESTIONS.find((q) => q.id === questionId);
    if (!question) {
      return res.status(400).json({
        success: false,
        error: `Question ${questionId} not found`,
      });
    }

    let aiResponse;
    if (question.hasAIResponse && questionId === 'q1') {
      const responseObj = getQ1Response(String(answer));
      aiResponse = responseObj.response;
    }

    await saveOnboardingAnswer(
      supplierId,
      questionId,
      answer,
      answerType || question.answerType,
      aiResponse
    );

    const progress = await getOnboardingProgress(supplierId);

    const answers = await getAllOnboardingAnswers(supplierId);
    const nextQuestion = ONBOARDING_QUESTIONS.find((q) => !answers[q.id]);

    res.json({
      success: true,
      questionId,
      aiResponse: aiResponse ? { response: aiResponse, source: 'research' } : null,
      progress,
      nextQuestion: nextQuestion
        ? { id: nextQuestion.id, number: nextQuestion.number, title: nextQuestion.title }
        : null,
      onboardingComplete: progress.percentComplete === 100,
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit answer',
      details: error.message,
    });
  }
});

app.get('/api/onboarding/progress/:supplierId', async (req, res) => {
  try {
    const { supplierId } = req.params;
    const progress = await getOnboardingProgress(supplierId);

    res.json({
      success: true,
      supplierId,
      progress,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress',
    });
  }
});

app.get('/api/onboarding/all-answers/:supplierId', async (req, res) => {
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
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Questions: http://localhost:${PORT}/api/onboarding/questions`);
});
