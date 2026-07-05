/**
 * types.ts — Debt Feature UI types
 * Các kiểu dữ liệu thuần UI (không liên quan trực tiếp đến API).
 * Kiểu dữ liệu API (DebtDTO, DebtRequest, DebtSummary) được định nghĩa trong apiTypes.ts.
 */

export type SidebarTab = 'dashboard' | 'debt' | 'transactions' | 'reports' | 'budgets' | 'settings';

export interface KPICardData {
  title: string;
  value: string;
  subtext: string;
  trend?: {
    value: string;
    isUp: boolean;
    label: string;
  };
  highlightColor?: string;
}
