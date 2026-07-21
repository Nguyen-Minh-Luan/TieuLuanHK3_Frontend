import { useState, useEffect } from 'react';
import { X, Download, FileText, Loader2 } from 'lucide-react';
import type { OriginalDocumentDTO } from '../../services/documentService';
import documentService from '../../services/documentService';

interface DocumentPreviewModalProps {
  document: OriginalDocumentDTO;
  onClose: () => void;
}

export default function DocumentPreviewModal({ document, onClose }: DocumentPreviewModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPdf = document.contentType === 'application/pdf' || document.fileName?.toLowerCase().endsWith('.pdf');

  useEffect(() => {
    let activeUrl: string | null = null;
    
    const fetchImage = async () => {
      if (!document.id) return;
      try {
        setLoading(true);
        const url = await documentService.fetchImageAsBlobUrl(document.id);
        activeUrl = url;
        setBlobUrl(url);
      } catch (err: any) {
        setError('Không thể tải hình ảnh chứng từ');
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [document.id]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = window.document.createElement('a');
    a.href = blobUrl;
    a.download = document.fileName || `document_${document.id}`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-sm p-4 sm:p-8">
      <div 
        className="w-full max-w-5xl max-h-full flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-[zoomIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9] bg-[#f8f9fb] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#003178]/10 rounded-xl">
              <FileText className="w-5 h-5 text-[#003178]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0f172a] font-display">
                {document.fileName || 'Chi tiết chứng từ'}
              </h3>
              <p className="text-xs text-[#64748b]">
                {document.documentCode} {document.transactionId ? `• Thuộc giao dịch #${document.transactionId}` : '• Chưa gắn giao dịch'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={!blobUrl || loading}
              title="Tải về"
              className="p-2 text-[#3b82f6] hover:bg-[#eff6ff] rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#f1f5f9] overflow-auto flex items-center justify-center p-4 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-[#64748b]">
              <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
              <p className="text-sm font-medium">Đang tải tài liệu...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 text-[#ef4444]">
              <FileText className="w-12 h-12 opacity-50" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : blobUrl ? (
            isPdf ? (
              <iframe 
                src={blobUrl} 
                className="w-full h-full rounded-lg shadow-sm bg-white"
                title={document.fileName}
              />
            ) : (
              <img 
                src={blobUrl} 
                alt={document.fileName}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-sm"
              />
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
