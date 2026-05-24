import {
  Trash2,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Cloud,
  Building2,
  Plane,
  MessageSquare,
  Laptop,
  type LucideIcon,
} from "lucide-react";

import { motion } from "motion/react";
import { MOCK_TRANSACTIONS } from "./constant";
import { TransactionStatus } from "./types";

const IconMap: Record<string, LucideIcon> = {
  Cloud,
  Building2,
  Plane,
  MessageSquare,
  Laptop,
};

export default function TransactionTable() {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden flex flex-col mb-20">
      {/* Bulk Actions Bar */}
      <div className="p-6 border-b border-surface-container-low flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-on-surface-variant">
            <b className="text-primary">12</b> transactions selected
          </span>
          <div className="h-4 w-px bg-outline-variant/30 mx-2"></div>
          <button className="text-sm font-bold text-error hover:bg-error-container/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
            <Trash2 size={14} />
            Delete
          </button>
        </div>

        <div className="flex gap-3">
          <button className="bg-surface-container-low text-on-surface text-sm font-bold px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-surface-container-high transition-colors">
            <Download size={14} />
            Export Excel
          </button>
          <button className="bg-surface-container-low text-on-surface text-sm font-bold px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-surface-container-high transition-colors">
            <FileText size={14} />
            PDF Report
          </button>
        </div>
      </div>

      {/* The Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/30">
              <th className="px-6 py-4 w-12 text-center">
                <input
                  type="checkbox"
                  className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">
                Date & ID
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">
                Merchant / Vendor
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">
                Category
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline text-right">
                Amount
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline text-center">
                Status
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low/50">
            {MOCK_TRANSACTIONS.map((trx, idx) => {
              const IconComp = IconMap[trx.icon] || Cloud;
              return (
                <motion.tr
                  key={trx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-surface-container-low/50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-5 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      defaultChecked={idx === 0}
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-on-surface">
                      {trx.date}
                    </div>
                    <div className="text-[10px] text-outline font-medium">
                      {trx.id}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          trx.status === TransactionStatus.COMPLETED
                            ? "bg-secondary-fixed text-secondary"
                            : trx.status === TransactionStatus.PENDING
                              ? "bg-tertiary-fixed text-tertiary"
                              : "bg-error-container/30 text-error"
                        }`}
                      >
                        <IconComp size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-on-surface">
                          {trx.merchant}
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-medium">
                          {trx.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold px-3 py-1 bg-surface-container-high/50 rounded-full text-on-surface-variant uppercase tracking-wider">
                      {trx.category}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-5 text-right font-headline font-bold text-sm ${
                      trx.status === TransactionStatus.CANCELLED
                        ? "line-through text-outline"
                        : ""
                    }`}
                  >
                    {trx.amount < 0
                      ? `-$${Math.abs(trx.amount).toLocaleString()}`
                      : `$${trx.amount.toLocaleString()}`}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                        trx.status === TransactionStatus.COMPLETED
                          ? "bg-secondary-fixed text-secondary"
                          : trx.status === TransactionStatus.PENDING
                            ? "bg-surface-container-high text-outline"
                            : "bg-error-container text-error"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          trx.status === TransactionStatus.COMPLETED
                            ? "bg-secondary"
                            : trx.status === TransactionStatus.PENDING
                              ? "bg-outline"
                              : "bg-error"
                        }`}
                      ></div>
                      {trx.status}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-primary/5 text-primary rounded-lg transition-colors cursor-pointer">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 hover:bg-primary/5 text-primary rounded-lg transition-colors cursor-pointer">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-6 border-t border-surface-container-low flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-xs font-medium text-outline">
          Showing 1-10 of 1,284 transactions
        </span>
        <div className="flex items-center gap-1">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-low text-outline transition-colors disabled:opacity-30">
            <ChevronLeft size={18} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-on-primary font-bold text-sm shadow-md">
            1
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-low text-on-surface font-medium text-sm transition-colors">
            2
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-low text-on-surface font-medium text-sm transition-colors">
            3
          </button>
          <span className="px-2 text-outline">...</span>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-low text-on-surface font-medium text-sm transition-colors">
            128
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-low text-outline transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
