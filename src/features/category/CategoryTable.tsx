import { Pencil, Trash2, ChevronLeft, ChevronRight, FolderOpen } from 'lucide-react';
import type { CategoryDTO } from '../../services/categoryService';

interface CategoryTableProps {
  items: CategoryDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit: (category: CategoryDTO) => void;
  onDelete: (category: CategoryDTO) => void;
  isLoading: boolean;
}

const formatVND = (num?: number) => {
  if (num == null) return '—';
  return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
};

const TypeBadge = ({ type }: { type: string }) => {
  if (type === 'INCOME') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f0fdf4] text-[#166534] border border-[#86efac]/30">
        Thu nhập
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]/30">
      Chi phí
    </span>
  );
};

export default function CategoryTable({
  items,
  totalElements,
  totalPages,
  currentPage,
  onPageChange,
  onEdit,
  onDelete,
  isLoading,
}: CategoryTableProps) {
  const startIndex = (currentPage - 1) * 10 + 1;
  const endIndex = Math.min(currentPage * 10, totalElements);

  return (
    <div id="category-table-section" className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,31,120,0.02)] overflow-hidden font-sans">
      {/* Table */}
      <div className="overflow-x-auto">
        <table id="category-data-table" className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8f9fb] text-[10px] font-mono tracking-widest text-[#64748b] uppercase border-b border-[#eaecf0]">
              <th className="py-4 px-5 font-semibold">TÊN DANH MỤC</th>
              <th className="py-4 px-5 font-semibold text-center">LOẠI</th>
              <th className="py-4 px-5 font-semibold">DANH MỤC CHA</th>
              <th className="py-4 px-5 font-semibold text-right">HẠN MỨC NGÂN SÁCH</th>
              <th className="py-4 px-5 font-semibold text-center">THUẾ</th>
              <th className="py-4 px-5 font-semibold text-center">MÃ TK</th>
              <th className="py-4 px-5 font-semibold text-center">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-5">
                    <div className="h-4 bg-[#f1f5f9] rounded w-40" />
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="h-6 bg-[#f1f5f9] rounded-full w-20 mx-auto" />
                  </td>
                  <td className="py-4 px-5">
                    <div className="h-4 bg-[#f1f5f9] rounded w-28" />
                  </td>
                  <td className="py-4 px-5">
                    <div className="h-4 bg-[#f1f5f9] rounded w-24 ml-auto" />
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="h-4 bg-[#f1f5f9] rounded w-10 mx-auto" />
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="h-4 bg-[#f1f5f9] rounded w-10 mx-auto" />
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="h-6 bg-[#f1f5f9] rounded w-16 mx-auto" />
                  </td>
                </tr>
              ))
            ) : items.length > 0 ? (
              items.map((cat) => (
                <tr
                  key={cat.id}
                  id={`row-category-${cat.id}`}
                  className="hover:bg-[#f8f9fb]/60 group transition-all duration-150"
                >
                  {/* Tên danh mục */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${cat.type === 'INCOME' ? 'bg-[#f0fdf4] text-[#16a34a]' : 'bg-[#fff7ed] text-[#ea580c]'}`}>
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0f172a]">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-[#94a3b8] mt-0.5 truncate max-w-[200px]">{cat.description}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Loại */}
                  <td className="py-4 px-5 text-center">
                    <TypeBadge type={cat.type} />
                  </td>

                  {/* Danh mục cha */}
                  <td className="py-4 px-5">
                    {cat.parentName ? (
                      <span className="text-xs font-medium text-[#475569] bg-[#f1f5f9] px-2.5 py-1 rounded-md">
                        {cat.parentName}
                      </span>
                    ) : (
                      <span className="text-xs text-[#cbd5e1]">— Gốc —</span>
                    )}
                  </td>

                  {/* Ngân sách */}
                  <td className="py-4 px-5 text-right">
                    <span className="text-sm font-extrabold text-[#0f172a]">
                      {formatVND(cat.budgeting)}
                    </span>
                  </td>

                  {/* Thuế */}
                  <td className="py-4 px-5 text-center">
                    <span className="text-sm font-semibold text-[#475569]">
                      {cat.tax != null ? `${cat.tax}%` : '—'}
                    </span>
                  </td>

                  {/* Mã TK */}
                  <td className="py-4 px-5 text-center">
                    <span className="text-sm font-semibold text-[#475569]">
                      {cat.accountCode ? cat.accountCode : '—'}
                    </span>
                  </td>

                  {/* Thao tác */}
                  <td className="py-4 px-5 text-center">
                    <div className="flex items-center justify-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        id={`btn-edit-category-${cat.id}`}
                        title="Chỉnh sửa"
                        onClick={() => onEdit(cat)}
                        className="p-1.5 hover:bg-[#eff6ff] rounded-lg text-[#3b82f6] hover:text-[#1d4ed8] transition-all cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        id={`btn-delete-category-${cat.id}`}
                        title="Xóa"
                        onClick={() => onDelete(cat)}
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
                <td colSpan={7} className="py-16 text-center">
                  <FolderOpen className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
                  <p className="text-sm text-[#94a3b8] font-medium">Không tìm thấy danh mục nào.</p>
                  <p className="text-xs text-[#cbd5e1] mt-1">Thử thay đổi bộ lọc hoặc thêm danh mục mới.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 0 && (
        <div id="category-pagination" className="px-6 py-4 bg-[#f8f9fb]/50 border-t border-[#f1f5f9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#64748b] font-medium">
            Hiển thị{' '}
            <span className="font-semibold text-[#0f172a]">{totalElements > 0 ? startIndex : 0}</span>
            –
            <span className="font-semibold text-[#0f172a]">{endIndex}</span>{' '}
            trong{' '}
            <span className="font-semibold text-[#0f172a]">{totalElements}</span> danh mục
          </p>
          <div id="category-pagination-controls" className="flex items-center gap-1.5">
            <button
              id="btn-category-prev"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 border border-[#e2e8f0] rounded-lg hover:bg-white text-[#64748b] disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                id={`btn-category-page-${page}`}
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
              id="btn-category-next"
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
