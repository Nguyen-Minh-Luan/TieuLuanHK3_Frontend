/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import transactionService, { FetchParams } from "../../services/transactionService";
import type { TransactionResponse, TransactionRequest } from "./apiTypes";

export function useTransactions(initialParams: FetchParams = {}) {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<FetchParams>({
    page: 1,
    size: 10,
    sortBy: "transaction_date",
    sortDir: "desc",
    ...initialParams,
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await transactionService.getAll(params);
      setTransactions(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải dữ liệu giao dịch."
      );
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const create = async (data: TransactionRequest) => {
    const result = await transactionService.create(data);
    await fetchAll(); // Refresh list
    return result; // Returns ApiResponse<TransactionWithWarning> containing transaction + warning
  };

  const update = async (id: number, data: TransactionRequest) => {
    const result = await transactionService.update(id, data);
    await fetchAll();
    return result;
  };

  const cancel = async (id: number) => {
    const result = await transactionService.cancel(id);
    await fetchAll();
    return result;
  };

  return {
    transactions,
    totalElements,
    totalPages,
    loading,
    error,
    params,
    setParams,
    create,
    update,
    cancel,
    refresh: fetchAll,
  };
}
