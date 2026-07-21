import { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Sidebar } from '../../component/Sidebar';
import Header from '../../component/Header';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import {
  fetchDocuments,
  deleteDocumentThunk,
  linkDocumentThunk,
  unlinkDocumentThunk,
  setParams,
} from '../../store/slices/documentSlice';
import { useDebounce } from '../../hooks/useDebounce';
import DocumentTable from './DocumentTable';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentPreviewModal from './DocumentPreviewModal';
import type { OriginalDocumentDTO } from '../../services/documentService';

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const TYPE_TABS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'UNLINKED', label: 'Chưa gắn giao dịch' },
] as const;

type FilterType = (typeof TYPE_TABS)[number]['value'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DocumentPage() {
  const dispatch = useAppDispatch();
  const { items, totalElements, totalPages, params, status, error } = useAppSelector(
    (s) => s.document
  );
  const role = useAppSelector((state) => state.auth.role);
  const canModify = role === 1 || role === 2;

  // ─── Local UI state ─────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<OriginalDocumentDTO | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // ─── Fetch khi params thay đổi hoặc status = idle ──────────────────────────
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchDocuments(params));
    }
  }, [status, params, dispatch]);

  // ─── Debounced search → update params ──────────────────────────────────────
  useEffect(() => {
    dispatch(setParams({ documentCode: debouncedSearch || undefined, page: 1 }));
  }, [debouncedSearch, dispatch]);

  // ─── Toast auto-dismiss ─────────────────────────────────────────────────────
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleTypeFilter = (newType: FilterType) => {
    setTypeFilter(newType);
    dispatch(setParams({ unlinkedOnly: newType === 'UNLINKED' ? true : undefined, page: 1 }));
  };

  const handlePreview = (doc: OriginalDocumentDTO) => {
    setPreviewDoc(doc);
  };

  const handleDelete = async (doc: OriginalDocumentDTO) => {
    if (!doc.id) return;
    if (
      confirm(
        `Bạn có chắc muốn xóa chứng từ "${doc.fileName}"?\nThao tác này không thể hoàn tác.`
      )
    ) {
      try {
        await dispatch(deleteDocumentThunk(doc.id)).unwrap();
        triggerToast(`Đã xóa chứng từ "${doc.fileName}" thành công!`, 'success');
      } catch (err: any) {
        triggerToast(err ?? 'Xóa chứng từ thất bại!', 'error');
      }
    }
  };

  const handleLink = async (doc: OriginalDocumentDTO) => {
    if (!doc.id) return;
    const transactionIdStr = prompt('Nhập ID giao dịch cần gắn:');
    if (!transactionIdStr) return;

    const transactionId = parseInt(transactionIdStr, 10);
    if (isNaN(transactionId)) {
      triggerToast('ID giao dịch không hợp lệ', 'error');
      return;
    }

    try {
      await dispatch(linkDocumentThunk({ id: doc.id, transactionId })).unwrap();
      triggerToast(`Đã gắn chứng từ với giao dịch #${transactionId}!`, 'success');
    } catch (err: any) {
      triggerToast(err ?? 'Gắn chứng từ thất bại!', 'error');
    }
  };

  const handleUnlink = async (doc: OriginalDocumentDTO) => {
    if (!doc.id) return;
    if (confirm(`Bạn có chắc muốn gỡ chứng từ khỏi giao dịch #${doc.transactionId}?`)) {
      try {
        await dispatch(unlinkDocumentThunk(doc.id)).unwrap();
        triggerToast(`Đã gỡ chứng từ thành công!`, 'success');
      } catch (err: any) {
        triggerToast(err ?? 'Gỡ chứng từ thất bại!', 'error');
      }
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setParams({ page }));
  };

  // ─── Tab active style ────────────────────────────────────────────────────────
  const tabClass = (tab: FilterType) => {
    const base = 'px-4 py-2 rounded-xl text-xs font-bold transition-all';
    if (typeFilter !== tab) return `${base} bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8f9fb]`;
    const activeMap: Record<FilterType, string> = {
      ALL: `${base} bg-[#003178] text-white shadow-sm`,
      UNLINKED: `${base} bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]/40`,
    };
    return activeMap[tab];
  };

  return (
    <div
      id="app-root-container"
      className="flex min-h-screen bg-surface text-on-surface-custom selection:bg-primary/10 select-none font-sans relative antialiased"
    >
      {/* Toast */}
      {toast && (
        <div
          id="toast-notification"
          className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white border border-outline-variant py-3.5 px-5 rounded-2xl shadow-xl transition-all duration-300 animate-[slideDown_0.2s_ease-out]"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="text-xs font-bold text-on-surface-custom">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:bg-surface-container-high rounded-lg text-outline hover:text-on-surface-custom transition-all ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        id="app-main-content-well"
        className="flex-1 flex flex-col min-h-screen bg-surface overflow-hidden"
      >
        {/* Shared Header with search */}
        <Header
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Tìm kiếm theo mã chứng từ..."
        />
        <div className="flex-1 px-8 py-8 space-y-8 overflow-y-auto">
          {/* Page Title & Controls */}
          <section id="document-headline-bar" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-[#003178]/10 rounded-xl">
                  <FileText className="w-5 h-5 text-[#003178]" />
                </div>
                <h2 className="text-3xl font-display font-extrabold text-[#003178] tracking-tight">
                  Quản lý chứng từ
                </h2>
              </div>
              <p className="text-xs font-medium text-[#64748b] mt-1.5">
                Quản lý hình ảnh chứng từ, hóa đơn gốc và liên kết với giao dịch.
              </p>
            </div>
            {canModify && (
              <button
                id="btn-upload-document"
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-[#003178] hover:bg-[#00255a] text-white py-3 px-6 rounded-xl flex items-center gap-2 font-display text-xs font-bold transition-all shadow-md hover:shadow-indigo-900/10 active:scale-[0.98]"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Tải lên chứng từ</span>
              </button>
            )}
          </section>

          {/* Type Filter Tabs */}
          <section id="document-filter-bar" className="flex items-center gap-2 flex-wrap">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.value}
                id={`filter-type-${tab.value}`}
                onClick={() => handleTypeFilter(tab.value)}
                className={tabClass(tab.value)}
              >
                {tab.label}
              </button>
            ))}
            {error && status === 'failed' && (
              <span className="text-xs text-[#ef4444] font-medium ml-2">⚠ {error}</span>
            )}
          </section>

          {/* Document Table */}
          <section id="document-table-section">
            <DocumentTable
              items={items}
              totalElements={totalElements}
              totalPages={totalPages}
              currentPage={params.page ?? 1}
              pageSize={params.size ?? 10}
              onPageChange={handlePageChange}
              onPreview={handlePreview}
              onDelete={handleDelete}
              onLink={handleLink}
              onUnlink={handleUnlink}
              isLoading={status === 'loading'}
              canModify={canModify}
            />
          </section>
        </div>
      </main>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <DocumentUploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={(msg) => triggerToast(msg, 'success')}
          onError={(msg) => triggerToast(msg, 'error')}
        />
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
