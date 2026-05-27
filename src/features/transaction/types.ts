/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  date: string;
  time: string;
  description: string;
  refId: string;
  category: string;
  amount: number; // Negative for expense, positive for revenue
  overSpending: "Critical" | "Warning" | "Fine";
  status: "Completed" | "Pending" | "Failed";
  icon: "building" | "payment" | "maintenance" | "cloud" | "payroll" | "other";
}

export interface Budget {
  category: string;
  allocated: number;
  spent: number;
  color: string;
}

export type ViewType =
  | "Dashboard"
  | "Transactions"
  | "Reports"
  | "Budgets"
  | "Settings";
