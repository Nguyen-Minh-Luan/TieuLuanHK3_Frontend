import apiClient from './apiClient';

export interface ChartOfAccount {
  code: string;
  name: string;
  group: string;
}

export const chartOfAccountService = {
  getAll: async (group?: string): Promise<ChartOfAccount[]> => {
    const params = group ? { group } : {};
    const response = await apiClient.get<ChartOfAccount[]>('/accounts', { params });
    return response.data;
  },
};
