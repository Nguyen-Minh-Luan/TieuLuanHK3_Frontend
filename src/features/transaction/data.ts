/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Budget } from "./types";

export const CATEGORIES = [
  "All Categories",
  "Procurement",
  "Revenue",
  "Maintenance",
  "Infrastructure",
  "HR & Payroll",
];

export const STATUSES = ["Tất cả trạng thái", "ACTIVE", "CANCELLED", "UPDATED"];

export const INITIAL_BUDGET_DATA: Budget[] = [
  {
    category: "Procurement",
    allocated: 50000,
    spent: 34550,
    color: "from-blue-600 to-blue-800",
  },
  {
    category: "Infrastructure",
    allocated: 15000,
    spent: 8650,
    color: "from-teal-600 to-teal-800",
  },
  {
    category: "Maintenance",
    allocated: 12000,
    spent: 3350,
    color: "from-amber-600 to-amber-800",
  },
  {
    category: "HR & Payroll",
    allocated: 100000,
    spent: 83000,
    color: "from-purple-600 to-purple-800",
  },
  {
    category: "Marketing & Other",
    allocated: 20000,
    spent: 15400,
    color: "from-slate-600 to-slate-800",
  },
];
