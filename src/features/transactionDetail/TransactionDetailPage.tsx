/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TransactionDetails from './TransactionDetails';
import PrintVoucherModal from './PrintVoucherModal';
import { Sidebar } from '../../component/Sidebar';
import Header from '../../component/Header';
import { useTransactionDetail } from './useTransactionDetail';
import toast from 'react-hot-toast';
import { ChevronLeft } from 'lucide-react';

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isPrintVoucherOpen, setIsPrintVoucherOpen] = useState<boolean>(false);

  const {
    selectedTransaction,
    relatedDebt,
    spendingWarning,
    lookupsReady,
    detailLoading,
    detailError,
    updateTransaction,
    cancelTransaction
  } = useTransactionDetail(id);

  // Handler: Update transaction via API
  const handleUpdate = async (updated: any) => {
    try {
      await updateTransaction(updated);
      toast.success(`Đã cập nhật thay đổi thành công cho giao dịch!`);
    } catch (err: any) {
      toast.error(err?.message || 'Cập nhật giao dịch thất bại.');
    }
  };

  // Handler: Cancel payment transaction via API
  const handleCancel = async (idStr: string) => {
    if (confirm(`Bạn có chắc chắn muốn hủy giao dịch này? Thao tác này sẽ đánh dấu trạng thái giao dịch thành CANCELLED.`)) {
      try {
        await cancelTransaction(idStr);
        toast.success(`Đã hủy thành công giao dịch!`);
      } catch (err: any) {
        toast.error(err?.message || 'Hủy giao dịch thất bại.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#191c1e] relative flex antialiased selection:bg-[#003178]/20 transition-all font-sans">

      {/* 1. Desktop Nav rail (Left column) */}
      <Sidebar />

      {/* 2. Main Workspace Canvas Section */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">

        {/* Core Header stickiness */}
        <Header showSearch={false} />

        {/* Content viewport area */}
        <main className="flex-1 px-8 py-8 overflow-y-auto">

          {/* Core Details Display */}
          <div className="w-full">
            {!lookupsReady || detailLoading ? (
              <div className="bg-white border border-[#eceef0] rounded-xl p-12 text-center text-sm text-[#737783] animate-pulse shadow-sm">
                Đang tải chi tiết giao dịch...
              </div>
            ) : detailError ? (
              <div className="bg-white border border-red-100 rounded-xl p-12 text-center text-sm text-red-500 shadow-sm">
                {detailError}
              </div>
            ) : selectedTransaction ? (
              <TransactionDetails
                transaction={selectedTransaction}
                relatedDebt={relatedDebt}
                spendingWarning={spendingWarning}
                onUpdate={handleUpdate}
                onCancel={handleCancel}
                onPrintClick={() => setIsPrintVoucherOpen(true)}
              />
            ) : (
              <div className="bg-white border border-[#eceef0] rounded-xl p-12 text-center text-sm text-[#737783] shadow-sm">
                Không tìm thấy giao dịch hoặc xảy ra lỗi.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 3. Overlay Forms Modals */}
      {selectedTransaction && (
        <PrintVoucherModal
          isOpen={isPrintVoucherOpen}
          transactionId={selectedTransaction.apiId ?? selectedTransaction.id}
          onClose={() => setIsPrintVoucherOpen(false)}
        />
      )}

    </div>
  );
}
