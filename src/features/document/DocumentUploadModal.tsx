import { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, File, FileText, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { uploadDocumentThunk, resetSubmitStatus } from '../../store/slices/documentSlice';

interface DocumentUploadModalProps {
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export default function DocumentUploadModal({
  onClose,
  onSuccess,
  onError,
}: DocumentUploadModalProps) {
  const dispatch = useAppDispatch();
  const { submitStatus, error } = useAppSelector((s) => s.document);

  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (submitStatus === 'succeeded') {
      onSuccess('Tải lên chứng từ thành công');
      dispatch(resetSubmitStatus());
      onClose();
    } else if (submitStatus === 'failed' && error) {
      onError(error);
      dispatch(resetSubmitStatus());
    }
  }, [submitStatus, error, dispatch, onClose, onSuccess, onError]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Preview nếu là ảnh
      if (selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      if (droppedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(droppedFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      onError('Vui lòng chọn file');
      return;
    }

    const tId = transactionId ? parseInt(transactionId, 10) : undefined;
    if (transactionId && isNaN(tId!)) {
      onError('ID giao dịch không hợp lệ');
      return;
    }

    dispatch(uploadDocumentThunk({
      file,
      description: description || undefined,
      transactionId: tId,
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9] bg-[#f8f9fb]">
          <h3 className="text-lg font-bold text-[#0f172a] font-display flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#003178]" />
            Tải lên chứng từ
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-bold text-[#334155] mb-2">Tệp chứng từ (Ảnh/PDF)</label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer
                ${file ? 'border-[#3b82f6] bg-[#eff6ff]/50' : 'border-[#cbd5e1] hover:border-[#94a3b8] bg-[#f8f9fb]'}
              `}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {file ? (
                previewUrl ? (
                  <div className="relative group rounded-lg overflow-hidden border border-[#e2e8f0]">
                    <img src={previewUrl} alt="Preview" className="max-h-40 object-contain" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">Thay đổi tệp</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FileText className="w-10 h-10 text-[#3b82f6] mb-2" />
                    <span className="text-sm font-semibold text-[#0f172a]">{file.name}</span>
                    <span className="text-xs text-[#64748b]">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                )
              ) : (
                <>
                  <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                    <UploadCloud className="w-6 h-6 text-[#64748b]" />
                  </div>
                  <p className="text-sm font-semibold text-[#0f172a]">Kéo thả file vào đây hoặc click để chọn</p>
                  <p className="text-xs text-[#64748b] mt-1">Hỗ trợ JPG, PNG, PDF (Tối đa 10MB)</p>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#334155] mb-1.5">Mô tả chứng từ</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả hoặc ghi chú cho chứng từ..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-[#0f172a] focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] outline-none transition-all placeholder:text-[#94a3b8] resize-none"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#334155] mb-1.5">Gắn với giao dịch ID (Tùy chọn)</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ''))} // Chỉ cho phép số
                placeholder="VD: 123"
                className="w-full px-4 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-[#0f172a] focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] outline-none transition-all placeholder:text-[#94a3b8]"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#f1f5f9]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitStatus === 'loading' || !file}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#003178] hover:bg-[#00255a] disabled:opacity-50 transition-colors shadow-md shadow-[#003178]/10 flex items-center gap-2"
            >
              {submitStatus === 'loading' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Xác nhận
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
