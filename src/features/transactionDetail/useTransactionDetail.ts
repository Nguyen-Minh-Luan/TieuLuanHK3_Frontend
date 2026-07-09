/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import transactionService from '../../services/transactionService';
import debtService from '../../services/debtService';
import partnerService from '../../services/partnerService';
import categoryService from '../../services/categoryService';
import fundService from '../../services/fundService';

import type { TransactionResponse, SpendingWarning } from '../transaction/apiTypes';
import type { Transaction, RelatedDebt } from './types';
import { mapTransactionResponseToUi, mapUiToTransactionRequest } from './mappers';

import type { PartnerDTO } from '../../services/partnerService';
import type { CategoryDTO } from '../../services/categoryService';
import type { FundDTO } from '../budget/apiTypes';

export function useTransactionDetail(id?: string) {
  // Lookup states
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [partners, setPartners] = useState<PartnerDTO[]>([]);
  const [funds, setFunds] = useState<FundDTO[]>([]);
  const [lookupsReady, setLookupsReady] = useState(false);

  // Mapping maps
  const [categoriesMap, setCategoriesMap] = useState<Record<number, string>>({});
  const [partnersMap, setPartnersMap] = useState<Record<number, PartnerDTO>>({});
  const [fundsMap, setFundsMap] = useState<Record<number, string>>({});

  // Main data states
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [rawSelectedTransaction, setRawSelectedTransaction] = useState<TransactionResponse | null>(null);
  const [relatedDebt, setRelatedDebt] = useState<RelatedDebt | null>(null);
  const [spendingWarning, setSpendingWarning] = useState<SpendingWarning | null>(null);

  // Status states
  const [detailLoading, setDetailLoading] = useState(false);
  const [debtLoading, setDebtLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const isFirstMount = useRef(true);

  // 1. Fetch lookup data once
  useEffect(() => {
    async function loadLookups() {
      try {
        const [catsRes, partnersRes, fundsRes] = await Promise.all([
          categoryService.getAll({ page: 1, size: 1000 }),
          partnerService.getAll({ page: 1, size: 1000 }),
          fundService.getAll({ page: 1, size: 1000 })
        ]);

        const catsList = catsRes.content || [];
        const partnersList = partnersRes.content || [];
        const fundsList = fundsRes.content || [];

        setCategories(catsList);
        setPartners(partnersList);
        setFunds(fundsList);

        // Build lookup maps
        const catMap: Record<number, string> = {};
        catsList.forEach(c => {
          if (c.id) catMap[c.id] = c.name;
        });

        const partMap: Record<number, PartnerDTO> = {};
        partnersList.forEach(p => {
          if (p.id) partMap[p.id] = p;
        });

        const fMap: Record<number, string> = {};
        fundsList.forEach(f => {
          if (f.id) fMap[f.id] = f.name;
        });

        setCategoriesMap(catMap);
        setPartnersMap(partMap);
        setFundsMap(fMap);
        setLookupsReady(true);
      } catch (err: any) {
        console.error('Failed to load lookups in useTransactionDetail:', err);
        setDetailError('Không thể tải danh sách dữ liệu danh mục, đối tác hoặc nguồn quỹ.');
      }
    }

    if (isFirstMount.current) {
      isFirstMount.current = false;
      loadLookups();
    }
  }, []);

  // 2. Fetch transaction detail and its related debt by database ID
  const fetchDetail = useCallback(async (idStr: string) => {
    if (!lookupsReady) return;

    // Get database ID by splitting text format e.g., TXN-12 -> 12
    let dbId: number | null = null;
    if (idStr.includes('-')) {
      const parts = idStr.split('-');
      const numPart = Number(parts[parts.length - 1]);
      if (!isNaN(numPart)) {
        dbId = numPart;
      }
    } else {
      const numVal = Number(idStr);
      if (!isNaN(numVal)) {
        dbId = numVal;
      }
    }

    if (dbId === null) {
      setSelectedTransaction(null);
      setRawSelectedTransaction(null);
      setRelatedDebt(null);
      setSpendingWarning(null);
      return;
    }

    setDetailLoading(true);
    setDetailError(null);
    setRelatedDebt(null);

    try {
      const tx = await transactionService.getById(dbId);
      setRawSelectedTransaction(tx);
      const mappedUi = mapTransactionResponseToUi(tx, categoriesMap, partnersMap, fundsMap);
      setSelectedTransaction(mappedUi);

      // Load spending warning detail if warningLevel is Warning or Critical
      if (tx.warningLevel && tx.warningLevel !== 'NORMAL') {
        try {
          const warning = await transactionService.getWarningByCategory(tx.categoryId);
          setSpendingWarning(warning);
        } catch (warnErr) {
          console.warn(`Could not load spending warning for category ID ${tx.categoryId}:`, warnErr);
          setSpendingWarning(null);
        }
      } else {
        setSpendingWarning(null);
      }

      // If transaction has active debt link
      if (tx.debtId) {
        setDebtLoading(true);
        try {
          const debt = await debtService.getById(tx.debtId);
          setRelatedDebt({
            id: debt.id || tx.debtId,
            debtType: debt.debtType,
            title: debt.title,
            partnerName: debt.partnerName,
            totalAmount: debt.totalAmount,
            paidAmount: debt.paidAmount || 0,
            remainingAmount: debt.remainingAmount || 0,
            isPaid: debt.isPaid || false
          });
        } catch (debtErr) {
          console.warn(`Could not load related debt with ID ${tx.debtId}:`, debtErr);
          setRelatedDebt(null);
        } finally {
          setDebtLoading(false);
        }
      }
    } catch (err: any) {
      setDetailError(err?.response?.data?.message || err?.message || 'Không thể tải chi tiết giao dịch.');
      setSelectedTransaction(null);
      setRawSelectedTransaction(null);
      setSpendingWarning(null);
    } finally {
      setDetailLoading(false);
    }
  }, [lookupsReady, categoriesMap, partnersMap, fundsMap]);

  // Fetch transaction details automatically when id is changed and lookups are ready
  useEffect(() => {
    if (lookupsReady && id) {
      fetchDetail(id);
    }
  }, [id, lookupsReady, fetchDetail]);

  // 3. Update transaction API integration
  const updateTransaction = async (updated: Transaction) => {
    if (!rawSelectedTransaction) {
      throw new Error('Không tìm thấy thông tin giao dịch gốc để cập nhật.');
    }

    const payload = mapUiToTransactionRequest(
      updated,
      rawSelectedTransaction,
      categories,
      partners,
      funds
    );

    const apiId = updated.apiId ?? rawSelectedTransaction.id;
    const updatedResponse = await transactionService.update(apiId, payload);
    
    // Refresh details
    await fetchDetail(updated.id);

    return updatedResponse;
  };

  // 4. Cancel transaction API integration
  const cancelTransaction = async (idStr: string) => {
    let dbId: number | null = null;
    if (idStr.includes('-')) {
      const parts = idStr.split('-');
      const numPart = Number(parts[parts.length - 1]);
      if (!isNaN(numPart)) {
        dbId = numPart;
      }
    } else {
      const numVal = Number(idStr);
      if (!isNaN(numVal)) {
        dbId = numVal;
      }
    }

    if (dbId === null) {
      throw new Error('Mã giao dịch không hợp lệ để hủy.');
    }

    await transactionService.cancel(dbId);
    
    // Refresh details
    await fetchDetail(idStr);
  };

  return {
    selectedTransaction,
    relatedDebt,
    spendingWarning,
    lookupsReady,
    detailLoading,
    debtLoading,
    detailError,
    updateTransaction,
    cancelTransaction,
    refresh: () => id && fetchDetail(id),
  };
}
