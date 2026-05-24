export const TransactionStatus = {
  COMPLETED: "Completed",
  PENDING: "Pending",
  CANCELLED: "Cancelled",
} as const;
export type TransactionStatusType =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];
export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  description: string;
  amount: number;
  category: string;
  status: TransactionStatusType;
  icon: string;
}
