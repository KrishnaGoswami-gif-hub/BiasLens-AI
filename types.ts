export interface AssociationRule {
  antecedent: string[];
  consequent: string[];
  support: number;
  confidence: number;
  lift: number;
}

export interface BiasIndicator {
  type: 'Confirmation Bias' | 'Negativity Bias' | 'None';
  confidence: number;
  triggers: string[];
  description: string;
}

export interface SentimentAnalysis {
  score: number; // -1 to 1 (VADER Compound Score)
  label: 'Positive' | 'Negative' | 'Neutral';
  distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface PreprocessingData {
  originalTokenCount: number;
  cleanedTokenCount: number;
  removedStopwords: string[];
  lemmatizedTokens: string[];
}

export interface TopicBiasScore {
  topic: string;
  confirmationBias: number; // 0-1 intensity
  negativityBias: number; // 0-1 intensity
  neutral: number; // 0-1 intensity
}

export interface AnalysisResult {
  executiveSummary: string; // Simple English explanation of findings
  preprocessing: PreprocessingData;
  sentiment: SentimentAnalysis;
  bias: BiasIndicator[];
  rules: AssociationRule[];
  mainTopic: string;
  topicAnalysis: TopicBiasScore[];
}

export interface ReasoningStep {
  content: string;
  timestamp: number;
}

export interface DeepSeekAnalysisResult extends AnalysisResult {
  reasoning: ReasoningStep[];
}

export interface ComparisonMetrics {
  biasAgreement: number; // 0-1 score indicating how much both models agree
  sentimentDifference: number; // Absolute difference in sentiment scores
  uniqueInsights: {
    gemini: string[];
    deepseek: string[];
  };
}

export interface DualAnalysisResult {
  gemini: AnalysisResult;
  deepseek: DeepSeekAnalysisResult;
  comparison: ComparisonMetrics;
}

export type AIModel = 'gemini' | 'deepseek' | 'dual';