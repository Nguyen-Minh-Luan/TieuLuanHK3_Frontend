import { Pencil, Trash2, ChevronLeft, ChevronRight, Handshake } from 'lucide-react';
import type { PartnerDTO } from '../../services/partnerService';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PartnerTableProps {
  items: PartnerDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit: (partner: PartnerDTO) => void;
  onDelete: (partner: PartnerDTO) => void;
  isLoading: boolean;
}

// ─── Type badge helpers ───────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; cls: string }> = {
  CUSTOMER:  { label: 'Khách hàng',          cls: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]/40' },
  SUPPLIER:  { label: 'Nhà cung cấp',        cls: 'bg-[#f0fdf4] text-[#166534] border-[#86efac]/40' },
  INVESTOR:  { label: 'Nhà đầu tư',          cls: 'bg-[#fdf4ff] text-[#7e22ce] border-[#e9d5ff]/40' },
  PARTNER:   { label: 'ĐT chiến lược',       cls: 'bg-[#fff7ed] text-[#c2410c] border-[#ffedd5]/40' },
  OTHER:     { label: 'Khác',                cls: 'bg-[#f8f9fb] text-[#475569] border-[#e2e8f0]/40' },
};

const TypeBadge = ({ type }: { type?: string }) => {
  const cfg = type ? TYPE_CONFIG[type] : undefined;
  if (!cfg) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]/30">
        {type ?? '—'}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PartnerTable({
  items,
  totalElements,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  isLoading,
}: PartnerTableProps) {
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalElements);

  return (
    <div id="partner-table-wrapper" className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,31,120,0.02)] overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table id="partner-data-table" className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8f9fb] text-[10px] font-mono tracking-widest text-[#64748b] uppercase border-b border-[#eaecf0]">
              <th className="py-4 px-5 font-semibold">TÊN ĐỐI TÁC</th>
              <th className="py-4 px-5 font-semibold text-center">LOẠI</th>
              <th className="py-4 px-5 font-semibold">EMAIL</th>
              <th className="py-4 px-5 font-semibold">ĐỊA CHỈ</th>
              <th className="py-4 px-5 font-semibold text-center">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#f1f5f9] rounded-xl" />
                      <div className="h-4 bg-[#f1f5f9] rounded w-36" />
                    </div>
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="h-6 bg-[#f1f5f9] rounded-full w-24 mx-auto" />
                  </td>
                  <td className="py-4 px-5">
                    <div className="h-4 bg-[#f1f5f9] rounded w-40" />
                  </td>
                  <td className="py-4 px-5">
                    <div className="h-4 bg-[#f1f5f9] rounded w-32" />
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="h-6 bg-[#f1f5f9] rounded w-14 mx-auto" />
                  </td>
                </tr>
              ))
            ) : items.length > 0 ? (
              items.map((partner) => (
                <tr
                  key={partner.id}
                  id={`row-partner-${partner.id}`}
                  className="hover:bg-[#f8f9fb]/60 group transition-all duration-150"
                >
                  {/* Tên đối tác */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#003178]/8 rounded-xl text-[#003178] shrink-0">
                        <Handshake className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold text-[#0f172a]">{partner.name}</p>
                    </div>
                  </td>

                  {/* Loại */}
                  <td className="py-4 px-5 text-center">
                    <TypeBadge type={partner.type} />
                  </td>

                  {/* Email */}
                  <td className="py-4 px-5">
                    <a
                      href={`mailto:${partner.email}`}
                      className="text-sm text-[#3b82f6] hover:underline font-medium"
                    >
                      {partner.email}
                    </a>
                  </td>

                  {/* Địa chỉ */}
                  <td className="py-4 px-5">
                    <span className="text-sm text-[#475569] font-medium truncate max-w-[220px] block">
                      {partner.address ?? <span className="text-[#cbd5e1]">—</span>}
                    </span>
                  </td>

                  {/* Thao tác */}
                  <td className="py-4 px-5 text-center">
                    <div className="flex items-center justify-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        id={`btn-edit-partner-${partner.id}`}
                        title="Chỉnh sửa"
                        onClick={() => onEdit(partner)}
                        className="p-1.5 hover:bg-[#eff6ff] rounded-lg text-[#3b82f6] hover:text-[#1d4ed8] transition-all cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        id={`btn-delete-partner-${partner.id}`}
                        title="Xóa"
                        onClick={() => onDelete(partner)}
                        className="p-1.5 hover:bg-[#fee2e2] rounded-lg text-[#ef4444] hover:text-[#b91c1c] transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <Handshake className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
                  <p className="text-sm text-[#94a3b8] font-medium">Không tìm thấy đối tác nào.</p>
                  <p className="text-xs text-[#cbd5e1] mt-1">Thử thay đổi bộ lọc hoặc thêm đối tác mới.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 0 && (
        <div id="partner-pagination" className="px-6 py-4 bg-[#f8f9fb]/50 border-t border-[#f1f5f9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#64748b] font-medium">
            Hiển thị{' '}
            <span className="font-semibold text-[#0f172a]">{totalElements > 0 ? startIndex : 0}</span>
            –
            <span className="font-semibold text-[#0f172a]">{endIndex}</span>{' '}
            trong{' '}
            <span className="font-semibold text-[#0f172a]">{totalElements}</span> đối tác
          </p>
          <div id="partner-pagination-controls" className="flex items-center gap-1.5">
            <button
              id="btn-partner-prev"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 border border-[#e2e8f0] rounded-lg hover:bg-white text-[#64748b] disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                id={`btn-partner-page-${page}`}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-[#003178] text-white shadow-sm'
                    : 'border border-transparent hover:border-[#e2e8f0] text-[#64748b] hover:bg-white hover:text-[#0f172a]'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              id="btn-partner-next"
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
