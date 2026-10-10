export type ScanType = 'url' | 'text' | 'auto';

export interface ThreatRedFlag {
  signal: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  detail: string;
}

export interface ThreatScanReport {
  verdict: 'MALICIOUS' | 'HIGH_RISK' | 'SUSPICIOUS' | 'LIKELY_SAFE' | 'VERIFIED_LEGITIMATE';
  riskScore: number;
  title: string;
  summary: string;
  threatCategory: string;
  indicators: string[];
  redFlags: ThreatRedFlag[];
  technicalBreakdown?: string;
  recommendedActions: string[];
}

export interface InstagramBioAnalysis {
  suspiciousPatternsFound: string[];
  offPlatformRedirection: boolean;
  urgencyOrFinancialPitches: boolean;
  botPatternScore: number;
  explanation: string;
}

export interface InstagramMetricsAnalysis {
  ratioStatus: 'UNBALANCED_BOT_RATIO' | 'MASS_FOLLOW_FARM' | 'NORMAL_ORGANIC' | 'INFLUENCER_RATIO';
  ratioScoreExplanation: string;
  ghostFollowerRisk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
}

export interface InstagramScanReport {
  authenticityScore: number;
  fakeProbability: number;
  verdict: 'CONFIRMED_FAKE_BOT' | 'HIGH_RISK_IMPERSONATOR' | 'SUSPICIOUS_ENGAGEMENT' | 'LIKELY_ORGANIC_AUTHENTIC' | 'VERIFIED_GENUINE';
  confidence: number;
  profileSummary: string;
  bioAnalysis: InstagramBioAnalysis;
  metricsAnalysis: InstagramMetricsAnalysis;
  redFlags: ThreatRedFlag[];
  safetyTips: string[];
}

export interface ImageScanReport {
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAN';
  riskScore: number;
  detectedArtifacts: string[];
  textExtracted: string;
  analysis: string;
  immediateWarning: string;
  safeActions: string[];
}
