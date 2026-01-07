import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();

interface OnboardingAnswer {
  questionId: string;
  answer: string | number | string[];
  answerType: 'text' | 'number' | 'choice' | 'array' | 'year';
  submittedAt: admin.firestore.Timestamp;
  aiResponse?: string;
  responseGeneratedAt?: admin.firestore.Timestamp;
  confidenceScore?: {
    score: number;
    reason: string;
    dataSource: string;
  };
  status: 'received' | 'processed' | 'error';
  flags: Array<{
    type: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    message: string;
  }>;
}

interface SupplierRecord {
  supplierId: string;
  email: string;
  domain: string;
  displayName: string;
  emailVerified: boolean;
  domainVerified: boolean;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  onboardingStatus: 'started' | 'in_progress' | 'completed' | 'paused';
  subscription?: {
    tier: string;
    monthlyPrice: number;
    status: 'active' | 'paused' | 'canceled';
    startDate: string;
  };
  metadata: {
    signupSource: string;
    lastActiveAt: admin.firestore.Timestamp;
  };
}

// ============================================
// FIRESTORE OPERATIONS
// ============================================

/**
 * Save an onboarding answer to Firestore
 */
export async function saveOnboardingAnswer(
  supplierId: string,
  questionId: string,
  answer: string | number | string[],
  answerType: 'text' | 'number' | 'choice' | 'array' | 'year',
  aiResponse?: string
): Promise<boolean> {
  try {
    const answerData: OnboardingAnswer = {
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
  } catch (error) {
    console.error('Error saving onboarding answer:', error);
    throw error;
  }
}

/**
 * Get all onboarding answers for a supplier
 */
export async function getAllOnboardingAnswers(
  supplierId: string
): Promise<Record<string, OnboardingAnswer>> {
  try {
    const snapshot = await db
      .collection('suppliers')
      .doc(supplierId)
      .collection('onboarding_answers')
      .get();

    const answers: Record<string, OnboardingAnswer> = {};

    snapshot.forEach((doc) => {
      answers[doc.id] = doc.data() as OnboardingAnswer;
    });

    return answers;
  } catch (error) {
    console.error('Error fetching onboarding answers:', error);
    throw error;
  }
}

/**
 * Get a single onboarding answer
 */
export async function getOnboardingAnswer(
  supplierId: string,
  questionId: string
): Promise<OnboardingAnswer | null> {
  try {
    const doc = await db
      .collection('suppliers')
      .doc(supplierId)
      .collection('onboarding_answers')
      .doc(questionId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as OnboardingAnswer;
  } catch (error) {
    console.error('Error fetching single answer:', error);
    throw error;
  }
}

/**
 * Save or update a supplier record
 */
export async function saveSupplierRecord(
  supplierId: string,
  data: Partial<SupplierRecord>
): Promise<boolean> {
  try {
    const supplierData = {
      ...data,
      updatedAt: admin.firestore.Timestamp.now(),
    };

    await db.collection('suppliers').doc(supplierId).set(supplierData, { merge: true });

    return true;
  } catch (error) {
    console.error('Error saving supplier record:', error);
    throw error;
  }
}

/**
 * Get a supplier record
 */
export async function getSupplierRecord(supplierId: string): Promise<SupplierRecord | null> {
  try {
    const doc = await db.collection('suppliers').doc(supplierId).get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as SupplierRecord;
  } catch (error) {
    console.error('Error fetching supplier record:', error);
    throw error;
  }
}

/**
 * Update onboarding status
 */
export async function updateOnboardingStatus(
  supplierId: string,
  status: 'started' | 'in_progress' | 'completed' | 'paused'
): Promise<boolean> {
  try {
    await db.collection('suppliers').doc(supplierId).update({
      onboardingStatus: status,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    return true;
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    throw error;
  }
}

/**
 * Get onboarding progress (answered vs total questions)
 */
export async function getOnboardingProgress(supplierId: string): Promise<{
  answeredQuestions: number;
  totalQuestions: number;
  percentComplete: number;
  status: string;
}> {
  try {
    const answers = await getAllOnboardingAnswers(supplierId);
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = 17;
    const percentComplete = Math.round((answeredCount / totalQuestions) * 100);

    const supplier = await getSupplierRecord(supplierId);
    const status = supplier?.onboardingStatus || 'not_started';

    return {
      answeredQuestions: answeredCount,
      totalQuestions,
      percentComplete,
      status,
    };
  } catch (error) {
    console.error('Error getting onboarding progress:', error);
    throw error;
  }
}

/**
 * Log an interaction (call, email, close, etc.)
 */
export async function logInteraction(
  supplierId: string,
  actionType: 'CALL' | 'EMAIL' | 'CLOSE' | 'MEETING' | 'NOTE',
  actionData: {
    leadId?: string;
    companyName?: string;
    contactPerson?: string;
    callDuration?: number;
    callOutcome?: string;
    emailSubject?: string;
    dealValue?: number;
    notes?: string;
  }
): Promise<boolean> {
  try {
    const timestamp = admin.firestore.Timestamp.now();
    const actionId = `${actionType}_${timestamp.toMillis()}_${Math.random().toString(36).substring(7)}`;

    await db
      .collection('suppliers')
      .doc(supplierId)
      .collection('interaction_history')
      .doc(actionId)
      .set({
        actionId,
        actionType,
        timestamp,
        ...actionData,
      });

    return true;
  } catch (error) {
    console.error('Error logging interaction:', error);
    throw error;
  }
}

/**
 * Cache AI recommendation for a buyer
 */
export async function cacheAIRecommendation(
  supplierId: string,
  buyerId: string,
  recommendation: {
    whyMatter: string;
    howToApproach: string;
    potentialRisks: string;
    successProbability: number;
    callScript?: string;
    emailTemplate?: string;
  }
): Promise<boolean> {
  try {
    const now = admin.firestore.Timestamp.now();
    const thirtyDaysLater = new Date(now.toDate().getTime() + 30 * 24 * 60 * 60 * 1000);

    await db
      .collection('suppliers')
      .doc(supplierId)
      .collection('ai_recommendations')
      .doc(buyerId)
      .set({
        buyerId,
        recommendation,
        generatedAt: now,
        expiresAt: admin.firestore.Timestamp.fromDate(thirtyDaysLater),
        llmModel: 'gemini-1.5-pro',
      });

    return true;
  } catch (error) {
    console.error('Error caching AI recommendation:', error);
    throw error;
  }
}

export default {
  saveOnboardingAnswer,
  getAllOnboardingAnswers,
  getOnboardingAnswer,
  saveSupplierRecord,
  getSupplierRecord,
  updateOnboardingStatus,
  getOnboardingProgress,
  logInteraction,
  cacheAIRecommendation,
};