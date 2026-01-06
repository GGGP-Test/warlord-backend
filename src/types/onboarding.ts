export interface OnboardingAnswer {
  supplierId: string;
  questionId: string; // q1 - q17
  answer: string | number | string[];
  answerType: 'text' | 'number' | 'year' | 'array' | 'choice';
  submittedAt: FirebaseFirestore.Timestamp;
  aiResponse?: string;
  responseGeneratedAt?: FirebaseFirestore.Timestamp;
  confidenceScore?: ConfidenceScore;
  status: 'received' | 'processed' | 'error';
  flags?: ContradictionFlag[];
  externalDataSources?: string[];
}

export interface ConfidenceScore {
  score: number;
  reason: string;
  dataSource: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  expiresAt: FirebaseFirestore.Timestamp;
}

export interface ContradictionFlag {
  type: 'contradiction' | 'suspicious' | 'incomplete';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  previousAnswer?: string | number | string[];
  currentAnswer?: string | number | string[];
}
