import { Pencil, Trash2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { UserRole, UserStatus, type User } from "./types.ts";

interface UserTableProps {
  users: User[];
  totalFilteredCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserTable({
  users,
  totalFilteredCount,
  currentPage,
  onPageChange,
  itemsPerPage,
  onEdit,
  onDelete
}: UserTableProps) {
  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalFilteredCount);

  // Helper to generate elegant chip classes based on user role
  const getRoleChipClass = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "bg-[#d9e2ff] text-[#001945]";
      case UserRole.ACCOUNTANT:
        return "bg-secondary-fixed text-on-secondary-fixed-custom";
      case UserRole.VIEWER:
      default:
        return "bg-surface-container-high text-on-surface-variant-custom";
    }
  };

  return (
    <div id="main-data-table-container" className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-surface-container-high/40">

      {/* Scrollable Table Viewport */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant-custom/10">
              <th className="px-6 py-4.5 text-xs font-bold text-on-surface-variant-custom uppercase tracking-wider">
                Họ và Tên
              </th>
              <th className="px-6 py-4.5 text-xs font-bold text-on-surface-variant-custom uppercase tracking-wider">
                Email tuyển dụng
              </th>
              <th className="px-6 py-4.5 text-xs font-bold text-on-surface-variant-custom uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-4.5 text-xs font-bold text-on-surface-variant-custom uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-4.5 text-xs font-bold text-on-surface-variant-custom uppercase tracking-wider text-right pr-8">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-dim/20">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-sm text-on-surface-variant-custom">
                  Không tìm thấy người dùng nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  id={`user-tr-${user.id}`}
                  key={user.id}
                  className="hover:bg-surface-container-low/50 transition-all duration-200 group"
                >
                  {/* Name and avatar */}
                  <td className="px-6 py-5.5">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs select-none shadow-sm ${user.avatarBg === "primary-gradient" ? "primary-gradient" : user.avatarBg
                        }`}>
                        {user.avatarInitials}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface-custom text-sm leading-tight group-hover:text-primary-custom transition-colors">
                          {user.name}
                        </p>
                        <p className="text-[11px] font-medium text-on-surface-variant-custom/75 mt-0.5">
                          ID: {user.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-5.5 text-sm text-on-surface-variant-custom font-normal font-mono">
                    {user.email}
                  </td>

                  {/* Role Chip */}
                  <td className="px-6 py-5.5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${getRoleChipClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Status Indicator */}
                  <td className="px-6 py-5.5">
                    {user.status === UserStatus.ACTIVE ? (
                      <div className="flex items-center gap-2 select-none">
                        <div className="w-2.5 h-2.5 rounded-full bg-secondary-custom shadow-[0_0_8px_rgba(0,99,152,0.45)] animate-pulse"></div>
                        <span className="text-xs font-semibold text-on-surface-custom">
                          Đang hoạt động
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 select-none">
                        <div className="w-2.5 h-2.5 rounded-full bg-outline-custom/40"></div>
                        <span className="text-xs font-semibold text-on-surface-variant-custom/70 italic">
                          Ngừng hoạt động
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Hover Actions (Edit & Delete) */}
                  <td className="px-6 py-5.5 text-right pr-6">
                    <div className="flex justify-end gap-2.5 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        id={`btn-edit-user-${user.id}`}
                        onClick={() => onEdit(user)}
                        className="p-2 text-on-surface-variant-custom hover:text-primary-custom hover:bg-primary-custom/10 rounded-xl transition-all cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        id={`btn-delete-user-${user.id}`}
                        onClick={() => onDelete(user)}
                        className="p-2 text-[#434652] hover:text-red-700 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Xóa thành viên"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination component underneath */}
      <div
        id="table-pagination-footer"
        className="px-6 py-4.5 bg-surface-container-low/20 border-t border-outline-variant-custom/10 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <p className="text-xs font-semibold text-on-surface-variant-custom/80 font-sans">
          {totalFilteredCount > 0
            ? `Hiển thị ${startIndex} - ${endIndex} trên tổng số ${totalFilteredCount.toLocaleString()} kết quả`
            : "Hiển thị 0 - 0 trên tổng số 0 kết quả"
          }
        </p>

        {/* Dynamic pager buttons */}
        <div className="flex items-center gap-1.5 select-none font-sans">
          <button
            id="pager-btn-prev"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-outline-variant-custom/20 text-on-surface-variant-custom hover:bg-surface-container-high transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isClickable = totalPages <= 6 || pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1;

            if (!isClickable) {
              if (pageNum === 2 || pageNum === totalPages - 1) {
                return (
                  <span key={pageNum} className="px-1.5 text-xs font-bold text-outline-variant-custom">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                id={`pager-btn-${pageNum}`}
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === pageNum
                  ? "primary-gradient text-white shadow-sm"
                  : "hover:bg-surface-container-high text-on-surface-custom"
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            id="pager-btn-next"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-outline-variant-custom/20 text-on-surface-variant-custom hover:bg-surface-container-high transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}
