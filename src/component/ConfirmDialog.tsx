/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title = "Xác nhận thao tác",
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const confirmColors =
    variant === "danger"
      ? "bg-rose-600 hover:bg-rose-700 text-white"
      : "bg-amber-500 hover:bg-amber-600 text-white";

  const iconColors =
    variant === "danger"
      ? "bg-rose-100 text-rose-600"
      : "bg-amber-100 text-amber-600";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm z-10 animate-fade-in">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-full ${iconColors} flex items-center justify-center mb-4 mx-auto`}>
          <AlertTriangle className="h-6 w-6" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-extrabold text-slate-900 text-center mb-2 font-headline">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-slate-500 text-center leading-relaxed mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            id="confirm-dialog-cancel"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            id="confirm-dialog-confirm"
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all active:scale-95 cursor-pointer ${confirmColors}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
