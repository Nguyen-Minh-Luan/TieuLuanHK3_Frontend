export interface SpendingSpike {
  category: string;
  overagePercent: number;
  comment: string;
}

export interface LiquidityRisk {
  hasRisk: boolean;
  message: string;
}

export interface AIInsightResponse {
  status: 'SUCCESS' | 'DEGRADED';
  cashFlowNarrative: string;
  cashFlowStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  spendingSpikes: SpendingSpike[];
  recommendations: string[];
  liquidityRisk: LiquidityRisk;
}
