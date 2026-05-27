/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Transaction } from './types';
import { Coins, LogOut, Ticket, Receipt, FileCheck } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  selectedId: string;
  onSelect: (id: string) => void;
  searchTerm: string;
}

export default function TransactionList({
  transactions,
  selectedId,
  onSelect,
  searchTerm
}: TransactionListProps) {

  // Clean filtering
  const filtered = transactions.filter(t => {
    const rawSearch = searchTerm.toLowerCase();
    return (
      t.id.toLowerCase().includes(rawSearch) ||
      t.counterparty.name.toLowerCase().includes(rawSearch) ||
      t.sourceOfFunds.toLowerCase().includes(rawSearch) ||
      t.category.toLowerCase().includes(rawSearch) ||
      t.type.toLowerCase().includes(rawSearch)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-[#d9e2ff] text-[#001945]';
      case 'CANCELLED':
        return 'bg-[#ffdad6] text-[#93000a]';
      default:
        return 'bg-[#eceef0] text-[#737783]';
    }
  };

  const formatCurrency = (val: number, cur: string) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#eceef0]/60 p-4 shrink-0 w-full lg:w-80 flex flex-col font-sans h-[calc(100vh-14rem)] lg:h-auto overflow-y-auto">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#eceef0]">
        <h3 className="font-headline text-sm font-extrabold text-[#191c1e] tracking-tight uppercase">
          Danh sách Giao dịch ({filtered.length})
        </h3>
        <span className="text-[10px] text-[#737783] font-bold">UTC+7</span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-[#737783] flex-1">
          <p className="font-semibold">Không tìm thấy giao dịch nào</p>
          <p className="text-[10px] mt-1">Thử thay đổi từ khóa tìm kiếm của bạn</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {filtered.map((item) => {
            const isSelected = item.id === selectedId;
            const isVoucherChi = item.type === 'PHIẾU CHI';

            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border flex flex-col gap-1.5 ${isSelected
                  ? 'border-[#003178] bg-[#d9e2ff]/20 shadow-sm'
                  : 'border-[#eceef0] hover:bg-[#f8f9fb] hover:border-[#c3c6d4]'
                  }`}
                id={`txn-list-item-${item.id}`}
              >
                {/* Meta details */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-mono font-bold text-[#434652]">{item.id}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${isVoucherChi ? 'bg-[#cde5ff] text-[#001d32]' : 'bg-[#e6e8ea] text-[#191c1e]'
                    }`}>
                    {item.type}
                  </span>
                </div>

                {/* Counterparty Title */}
                <p className="text-xs font-bold text-[#191c1e] line-clamp-1">
                  {item.counterparty.name}
                </p>

                {/* Pricing amount */}
                <div className="flex items-end justify-between w-full">
                  <span className="text-[10px] text-[#737783] font-medium truncate max-w-[130px]">
                    {item.category}
                  </span>
                  <div className="text-right">
                    <p className={`text-xs font-black ${isVoucherChi ? 'text-[#003178]' : 'text-emerald-700'}`}>
                      {isVoucherChi ? '-' : '+'}{formatCurrency(item.amount, item.currency)}
                    </p>
                    <p className="text-[8px] text-[#737783] text-right font-bold uppercase tracking-widest leading-none mt-0.5">
                      {item.currency}
                    </p>
                  </div>
                </div>

                {/* Status indicator row */}
                <div className="flex items-center justify-between pt-1 border-t border-[#f2f4f6] mt-1">
                  <span className="text-[9px] text-[#737783] italic">{item.date}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
