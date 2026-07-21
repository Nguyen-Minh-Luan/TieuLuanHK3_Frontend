/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { TransactionResponse, TransactionRequest } from '../transaction/apiTypes';
import type { Transaction } from './types';
import type { PartnerDTO } from '../../services/partnerService';
import type { CategoryDTO } from '../../services/categoryService';
import type { FundDTO } from '../budget/apiTypes';

export const formatDate = (isoStr?: string): string => {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '—';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '—';
  }
};

export const formatTime = (isoStr?: string): string => {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '—';
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds} - GMT+7`;
  } catch {
    return '—';
  }
};

export const toLocalDateInputValue = (d: Date | string): string => {
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function mapTransactionResponseToUi(
  tx: TransactionResponse,
  categoriesMap: Record<number, string>,
  partnersMap: Record<number, PartnerDTO>,
  fundsMap: Record<number, string>
): Transaction {
  const isVoucherChi = tx.type === 'EXPENSE' || tx.type === 'EXPENSE_DEBT';
  const type = isVoucherChi ? 'PHIẾU CHI' : 'PHIẾU THU';

  let status: 'ACTIVE' | 'CANCELLED' | 'UPDATED' = 'ACTIVE';
  if (tx.status === 'ACTIVE') {
    status = 'ACTIVE';
  } else if (tx.status === 'UPDATED') {
    status = 'UPDATED';
  } else if (tx.status === 'CANCELLED') {
    status = 'CANCELLED';
  }

  let riskStatus = 'FINE (Ổn định)';
  if (tx.warningLevel === 'CRITICAL') {
    riskStatus = 'RISK (Nguy cơ)';
  } else if (tx.warningLevel === 'WARNING') {
    riskStatus = 'WARNING (Cảnh báo)';
  } else if (tx.hasWarning) {
    riskStatus = 'RISK (Nguy cơ)';
  }

  const categoryName = categoriesMap[tx.categoryId] || `Danh mục #${tx.categoryId}`;
  const sourceOfFunds = fundsMap[tx.fundId] || `Nguồn quỹ #${tx.fundId}`;

  // Get partner details
  const partner = tx.partnerId ? partnersMap[tx.partnerId] : undefined;
  const counterpartyName = partner ? partner.name : 'Khách hàng vãng lai';
  const counterpartyMst = partner ? (partner.address || 'Không có MST') : 'Chưa cập nhật';

  // Limit fluctuations: sparkline levels generated based on ID
  const baseSeed = tx.id % 5;
  const limitFluctuations = baseSeed === 0 
    ? [30, 45, 40, 65, 100, 55, 70]
    : baseSeed === 1
    ? [20, 30, 45, 40, 50, 75, 90]
    : baseSeed === 2
    ? [90, 85, 95, 110, 80, 95, 120]
    : baseSeed === 3
    ? [40, 50, 45, 60, 40, 35, 30]
    : [50, 60, 55, 70, 85, 80, 95];

  return {
    id: tx.transactionCode || `TXN-${tx.id}`,
    apiId: tx.id,
    debtId: tx.debtId,
    type,
    status,
    riskStatus,
    sourceOfFunds,
    category: categoryName,
    amount: tx.amount,
    currency: 'VND',
    limitFluctuations,
    counterparty: {
      name: counterpartyName,
      mst: counterpartyMst,
      logoUrl: undefined,
    },
    creator: {
      name: tx.userName || `User #${tx.userId}`,
      role: '',
      avatarUrl: undefined,
    },
    date: formatDate(tx.transactionDate),
    createdAt: formatTime(tx.createdAt || tx.transactionDate),
    notes: tx.note || 'Không có ghi chú',
  };
}

export function mapUiToTransactionRequest(
  ui: Transaction,
  originalTx: TransactionResponse,
  categories: CategoryDTO[],
  partners: PartnerDTO[],
  funds: FundDTO[]
): TransactionRequest {
  const fund = funds.find(f => f.name === ui.sourceOfFunds);
  const category = categories.find(c => c.name === ui.category);
  const partner = partners.find(p => p.name === ui.counterparty.name);

  // Parse DD/MM/YYYY to YYYY-MM-DD
  let transactionDate = toLocalDateInputValue(originalTx.transactionDate);
  if (ui.date) {
    const parts = ui.date.split('/');
    if (parts.length === 3) {
      transactionDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  return {
    fundId: fund ? fund.id : originalTx.fundId,
    categoryId: category ? category.id! : originalTx.categoryId,
    partnerId: partner ? partner.id : originalTx.partnerId,
    userId: originalTx.userId || 1,
    type: originalTx.type as 'INCOME' | 'EXPENSE',
    amount: ui.amount,
    note: ui.notes,
    transactionDate,
    accompaniedBy: originalTx.accompaniedBy,
    originalDocuments: originalTx.originalDocuments,
    debtId: ui.debtId
  };
}
