import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { type User, UserRole, UserStatus } from "./types.ts";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: {
    id?: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
  }) => void;
  userToEdit: User | null;
}

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  userToEdit
}: UserFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.VIEWER);
  const [status, setStatus] = useState<UserStatus>(UserStatus.ACTIVE);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setRole(userToEdit.role);
      setStatus(userToEdit.status);
      setErrorMsg("");
    } else {
      setName("");
      setEmail("");
      setRole(UserRole.VIEWER);
      setStatus(UserStatus.ACTIVE);
      setErrorMsg("");
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập Họ và Tên.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Vui lòng nhập Email hợp lệ.");
      return;
    }

    onSubmit({
      id: userToEdit?.id,
      name: name.trim(),
      email: email.trim(),
      role,
      status
    });
    onClose();
  };

  return (
    <div id="user-form-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        id="modal-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Dialog Frame */}
      <div
        id="modal-dialog-content"
        className="relative bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container-high w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 id="modal-title" className="text-lg font-display font-extrabold text-on-surface-custom">
            {userToEdit ? "Chỉnh sửa thông tin người dùng" : "Thêm người dùng mới"}
          </h3>
          <button
            id="btn-close-modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant-custom hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div id="modal-error-alert" className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
            {errorMsg}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
          {/* Họ và Tên */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="input-name" className="text-xs font-bold text-on-surface-variant-custom uppercase tracking-wide">
              Họ và Tên
            </label>
            <input
              id="input-name"
              type="text"
              placeholder="Ví dụ: Nguyễn Văn Dũ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-container-highest/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-custom/15 outline-none font-sans"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="input-email" className="text-xs font-bold text-on-surface-variant-custom uppercase tracking-wide">
              Email tuyển dụng
            </label>
            <input
              id="input-email"
              type="email"
              placeholder="username@ledger.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-container-highest/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-custom/15 outline-none font-sans"
            />
          </div>

          {/* Vai trò */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="input-role" className="text-xs font-bold text-on-surface-variant-custom uppercase tracking-wide">
              Vai trò hệ thống
            </label>
            <select
              id="input-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-surface-container-low border border-surface-container-highest/20 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-custom/15 outline-none cursor-pointer font-sans font-medium text-on-surface-custom"
            >
              <option value={UserRole.ADMIN}>{UserRole.ADMIN}</option>
              <option value={UserRole.ACCOUNTANT}>{UserRole.ACCOUNTANT}</option>
              <option value={UserRole.VIEWER}>{UserRole.VIEWER}</option>
            </select>
          </div>

          {/* Trạng thái */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant-custom uppercase tracking-wide">
              Trạng thái tài khoản
            </label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2 cursor-pointer font-sans text-sm text-on-surface-custom">
                <input
                  id="status-radio-active"
                  type="radio"
                  name="user-status"
                  value={UserStatus.ACTIVE}
                  checked={status === UserStatus.ACTIVE}
                  onChange={() => setStatus(UserStatus.ACTIVE)}
                  className="w-4 h-4 text-primary-custom border-surface-container-highest focus:ring-primary-custom/20 focus:ring-2 cursor-pointer"
                />
                <span>Đang hoạt động</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-sans text-sm text-on-surface-custom">
                <input
                  id="status-radio-inactive"
                  type="radio"
                  name="user-status"
                  value={UserStatus.INACTIVE}
                  checked={status === UserStatus.INACTIVE}
                  onChange={() => setStatus(UserStatus.INACTIVE)}
                  className="w-4 h-4 text-primary-custom border-surface-container-highest focus:ring-primary-custom/20 focus:ring-2 cursor-pointer"
                />
                <span>Ngừng hoạt động</span>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-surface-container-high/60">
            <button
              id="btn-cancel-modal"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant-custom hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              id="btn-submit-modal"
              type="submit"
              className="primary-gradient text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-md shadow-primary-custom/10 hover:scale-[1.01] active:drop-shadow transition-all cursor-pointer"
            >
              <Check size={16} className="stroke-[2.5]" />
              {userToEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
