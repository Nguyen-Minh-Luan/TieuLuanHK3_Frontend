import { Eye, Trash2, ChevronLeft, ChevronRight, FileImage, Link as LinkIcon, Unlink } from 'lucide-react';
import type { OriginalDocumentDTO } from '../../services/documentService';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

// ─── Props ────────────────────────────────────────────────────────────────────

interface DocumentTableProps {
  items: OriginalDocumentDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPreview: (doc: OriginalDocumentDTO) => void;
  onDelete: (doc: OriginalDocumentDTO) => void;
  onLink: (doc: OriginalDocumentDTO) => void;
  onUnlink: (doc: OriginalDocumentDTO) => void;
  isLoading: boolean;
  canModify: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DocumentTable({
  items,
  totalElements,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
  onPreview,
  onDelete,
  onLink,
  onUnlink,
  isLoading,
  canModify,
}: DocumentTableProps) {
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalElements);

  return (
    <div id="document-table-wrapper" className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,31,120,0.02)] overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table id="document-data-table" className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8f9fb] text-[10px] font-mono tracking-widest text-[#64748b] uppercase border-b border-[#eaecf0]">
              <th className="py-4 px-5 font-semibold">MÃ CT</th>
              <th className="py-4 px-5 font-semibold">TÊN FILE / MÔ TẢ</th>
              <th className="py-4 px-5 font-semibold">NGƯỜI TẢI LÊN</th>
              <th className="py-4 px-5 font-semibold text-center">LIÊN KẾT</th>
              <th className="py-4 px-5 font-semibold text-center">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-5">
                    <div className="h-4 bg-[#f1f5f9] rounded w-24" />
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#f1f5f9] rounded-xl" />
                      <div>
                        <div className="h-4 bg-[#f1f5f9] rounded w-36 mb-1" />
                        <div className="h-3 bg-[#f1f5f9] rounded w-24" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="h-4 bg-[#f1f5f9] rounded w-32 mb-1" />
                    <div className="h-3 bg-[#f1f5f9] rounded w-20" />
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="h-6 bg-[#f1f5f9] rounded-full w-24 mx-auto" />
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="h-6 bg-[#f1f5f9] rounded w-14 mx-auto" />
                  </td>
                </tr>
              ))
            ) : items.length > 0 ? (
              items.map((doc) => (
                <tr
                  key={doc.id}
                  id={`row-document-${doc.id}`}
                  className="hover:bg-[#f8f9fb]/60 group transition-all duration-150"
                >
                  <td className="py-4 px-5">
                    <span className="text-sm font-bold text-[#0f172a]">{doc.documentCode}</span>
                  </td>

                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#003178]/8 rounded-xl text-[#003178] shrink-0">
                        <FileImage className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0f172a] truncate max-w-[200px]" title={doc.fileName}>
                          {doc.fileName}
                        </p>
                        <p className="text-xs text-[#64748b] truncate max-w-[200px]" title={doc.description}>
                          {doc.description || <span className="italic opacity-50">Không có mô tả</span>}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <p className="text-sm font-medium text-[#0f172a]">{doc.uploadedByName}</p>
                    <p className="text-xs text-[#64748b]">{dayjs(doc.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                  </td>

                  <td className="py-4 px-5 text-center">
                    {doc.transactionId ? (
                      <Link
                        to={`/transactions/${doc.transactionId}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f0fdf4] text-[#166534] border border-[#86efac]/40 hover:bg-[#dcfce7] transition-colors"
                        title="Xem chi tiết giao dịch"
                      >
                        <LinkIcon className="w-3 h-3" />
                        Giao dịch #{doc.transactionId}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]/30">
                        Chưa gắn
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5 text-center">
                    <div className="flex items-center justify-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Xem ảnh"
                        onClick={() => onPreview(doc)}
                        className="p-1.5 hover:bg-[#eff6ff] rounded-lg text-[#3b82f6] hover:text-[#1d4ed8] transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {canModify && (
                        <>
                          {doc.transactionId ? (
                            <button
                              title="Gỡ giao dịch"
                              onClick={() => onUnlink(doc)}
                              className="p-1.5 hover:bg-[#fff7ed] rounded-lg text-[#ea580c] hover:text-[#c2410c] transition-all cursor-pointer"
                            >
                              <Unlink className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              title="Gắn giao dịch"
                              onClick={() => onLink(doc)}
                              className="p-1.5 hover:bg-[#f0fdf4] rounded-lg text-[#16a34a] hover:text-[#15803d] transition-all cursor-pointer"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            title="Xóa"
                            onClick={() => onDelete(doc)}
                            className="p-1.5 hover:bg-[#fee2e2] rounded-lg text-[#ef4444] hover:text-[#b91c1c] transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <FileImage className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
                  <p className="text-sm text-[#94a3b8] font-medium">Không tìm thấy chứng từ nào.</p>
                  <p className="text-xs text-[#cbd5e1] mt-1">Thử thay đổi bộ lọc hoặc tải lên chứng từ mới.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 0 && (
        <div id="document-pagination" className="px-6 py-4 bg-[#f8f9fb]/50 border-t border-[#f1f5f9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#64748b] font-medium">
            Hiển thị{' '}
            <span className="font-semibold text-[#0f172a]">{totalElements > 0 ? startIndex : 0}</span>
            –
            <span className="font-semibold text-[#0f172a]">{endIndex}</span>{' '}
            trong{' '}
            <span className="font-semibold text-[#0f172a]">{totalElements}</span> chứng từ
          </p>
          <div id="document-pagination-controls" className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 border border-[#e2e8f0] rounded-lg hover:bg-white text-[#64748b] disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === page
                  ? 'bg-[#003178] text-white shadow-sm'
                  : 'border border-transparent hover:border-[#e2e8f0] text-[#64748b] hover:bg-white hover:text-[#0f172a]'
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 border border-[#e2e8f0] rounded-lg hover:bg-white text-[#64748b] disabled:opacity-40 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
