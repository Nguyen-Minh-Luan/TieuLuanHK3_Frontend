import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { fetchAIInsights } from '../../store/slices/aiInsightSlice';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw, Loader2, Lightbulb, Activity } from 'lucide-react';
import type { RootState } from '../../store';

export const AIInsightPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error, lastFetched } = useSelector((state: RootState) => state.aiInsight);
  const months = 6;

  useEffect(() => {
    if (!data && !loading && !error) {
      dispatch(fetchAIInsights({ months }));
    }
  }, [dispatch, data, loading, error, months]);

  const handleRefresh = () => {
    dispatch(fetchAIInsights({ months, forceRefresh: true }));
  };

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'HEALTHY':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Khỏe mạnh</span>;
      case 'WARNING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" /> Cảnh báo</span>;
      case 'CRITICAL':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><Activity className="w-3 h-3 mr-1" /> Nguy hiểm</span>;
      default:
        return null;
    }
  };

  if (loading && !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang phân tích dữ liệu tài chính với AI...</p>
        <p className="text-gray-400 text-sm mt-2">Việc này có thể mất vài giây để tổng hợp dữ liệu {months} tháng gần nhất.</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 bg-red-50">
        <div className="flex items-center gap-3 text-red-600 mb-2">
          <AlertTriangle className="w-6 h-6" />
          <h3 className="text-lg font-bold">Lỗi Phân Tích AI</h3>
        </div>
        <p className="text-red-700">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 flex items-center px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Thử lại
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-none">CFO Ảo (AI Insight)</h3>
            <p className="text-xs text-gray-500 mt-1">
              Phân tích tự động dựa trên dữ liệu {months} tháng gần nhất
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data.status === 'DEGRADED' && (
            <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
              Chế độ rút gọn
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="Làm mới phân tích"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        {/* Liquidity Risk Alert */}
        {data.liquidityRisk?.hasRisk && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800">Cảnh báo rủi ro thanh khoản!</h4>
              <p className="text-red-700 text-sm mt-1">{data.liquidityRisk.message}</p>
            </div>
          </div>
        )}

        {/* Cash Flow Narrative */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Nhận định dòng tiền
            </h4>
            {renderStatusBadge(data.cashFlowStatus)}
          </div>
          <p className="text-gray-700 leading-relaxed text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
            {data.cashFlowNarrative}
          </p>
        </div>

        {/* Spending Spikes */}
        {data.spendingSpikes && data.spendingSpikes.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-orange-500" /> Chi tiêu tăng đột biến
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.spendingSpikes.map((spike, idx) => (
                <div key={idx} className="border border-orange-200 bg-orange-50/30 p-3 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-900 text-sm">{spike.category}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-800">
                      +{spike.overagePercent.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{spike.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="mt-auto pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-600" /> Khuyến nghị hành động
            </h4>
            <ul className="space-y-2">
              {data.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-green-500 font-bold mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {lastFetched && (
        <div className="px-6 py-2 bg-gray-50 text-xs text-gray-400 text-right">
          Cập nhật lần cuối: {new Date(lastFetched).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};
