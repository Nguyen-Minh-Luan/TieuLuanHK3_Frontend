export type DebtStatus = 'Critical' | 'Warning' | 'Fine' | 'Paid';

export type CreditorType = 'bank' | 'tech' | 'real_estate' | 'logistics' | 'other' | 'receivable' | 'payable';

export interface Debt {
  id: string;
  dateCreated: string; // e.g., "12/05/2024"
  creditor: string;
  creditorType: CreditorType;
  referenceCode: string; // e.g., "INV-2024-0891"
  amount: number; // e.g., 450000000
  dueDate: string; // e.g., "10/06/2024"
  status: DebtStatus;
  description?: string;
  notes?: string;
}

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
