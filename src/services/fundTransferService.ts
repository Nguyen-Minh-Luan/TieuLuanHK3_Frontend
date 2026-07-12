import type { FundTransferDTO, FundTransferRequest } from '../features/fundTransfer/apiTypes';
import apiClient from './apiClient';
import type { ApiResponse } from '../features/transaction/apiTypes';

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const fundTransferService = {
  transferFund: async (data: FundTransferRequest): Promise<FundTransferDTO> => {
    const response = await apiClient.post<ApiResponse<FundTransferDTO>>('/fund-transfers', data);
    return response.data.data;
  },

  getTransferHistory: async (params: {
    fundId?: number;
    fromDate?: string;
    toDate?: string;
    createdBy?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'ASC' | 'DESC';
  }): Promise<PageResponse<FundTransferDTO>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<FundTransferDTO>>>('/fund-transfers', { params });
    return response.data.data;
  },

  getTransferById: async (id: number): Promise<FundTransferDTO> => {
    const response = await apiClient.get<ApiResponse<FundTransferDTO>>(`/fund-transfers/${id}`);
    return response.data.data;
  }
};
