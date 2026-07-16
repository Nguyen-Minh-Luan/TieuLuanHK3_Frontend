import apiClient from './apiClient';
import type { AIInsightResponse } from '../features/reports/aiInsightTypes';

export const aiInsightService = {
  getAIInsights: async (months: number = 6, forceRefresh: boolean = false): Promise<AIInsightResponse> => {
    const params = new URLSearchParams({
      months: months.toString(),
      forceRefresh: forceRefresh.toString()
    });
    const response = await apiClient.get<{ data: AIInsightResponse }>(`/reports/ai-insights?${params.toString()}`);
    return response.data.data;
  },
};
