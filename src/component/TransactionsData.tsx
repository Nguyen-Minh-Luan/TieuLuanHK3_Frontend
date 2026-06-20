import { ShoppingCart, Banknote, Plane, Utensils, Landmark, Filter } from "lucide-react";
import { cn } from "../lib/utils";

interface TransactionDTO {
  parentId?: number | null;
  fundId?: number | null;
  categoryId?: number | null;
  partnerId?: number | null;
  userId?: number | null;
  type: "INCOME" | "EXPENSE";
  status: string;
  amount: number;
  note?: string;
  transactionCode: string;
  transactionDate: string;
  createdAt?: string;
}

interface TransactionsDataProps {
  transactions: TransactionDTO[];
  categoriesMap: Record<number, string>;
}

export function TransactionsData({ transactions, categoriesMap }: TransactionsDataProps) {
  const getCategoryIcon = (categoryName: string, type: string) => {
    const name = categoryName.toLowerCase();
    if (type === "INCOME") {
      return { icon: Banknote, color: "bg-emerald-100 text-emerald-600" };
    }
    if (
      name.includes("travel") ||
      name.includes("di chuyển") ||
      name.includes("xe") ||
      name.includes("flight")
    ) {
      return { icon: Plane, color: "bg-slate-100 text-slate-600" };
    }
    if (
      name.includes("meal") ||
      name.includes("ăn") ||
      name.includes("food") ||
      name.includes("restaurant") ||
      name.includes("tiệc")
    ) {
      return { icon: Utensils, color: "bg-rose-100 text-rose-600" };
    }
    if (
      name.includes("equipment") ||
      name.includes("shopping") ||
      name.includes("mua") ||
      name.includes("thiết bị")
    ) {
      return { icon: ShoppingCart, color: "bg-orange-100 text-orange-600" };
    }
    return { icon: Landmark, color: "bg-blue-100 text-blue-600" };
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center">
        <h3 className="text-xl font-black text-brand-text font-display">
          Recent Transactions
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-200"
              >
                <img
                  src={`https://i.pravatar.cc/100?img=${i + 10}`}
                  alt="Member"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
              +4
            </div>
          </div>
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-brand-primary transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-8 py-4">Date</th>
              <th className="px-8 py-4">Description</th>
              <th className="px-8 py-4">Category</th>
              <th className="px-8 py-4 text-right">Amount</th>
              <th className="px-8 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-8 text-slate-400 text-sm font-medium"
                >
                  Không có giao dịch gần đây
                </td>
              </tr>
            ) : (
              transactions.map((t) => {
                const categoryName = t.categoryId
                  ? categoriesMap[t.categoryId] || "Other"
                  : "Other";
                const amountVal = t.type === "INCOME" ? t.amount : -t.amount;
                const statusLabel = t.status === "ACTIVE" ? "Completed" : "Pending";
                const { icon: IconComponent, color: iconColor } = getCategoryIcon(
                  categoryName,
                  t.type
                );

                return (
                  <tr
                    key={t.transactionCode}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                      {formatDate(t.transactionDate)}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${iconColor} transition-transform group-hover:scale-110`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                          {t.note || t.transactionCode}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-tight">
                        {categoryName}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "px-8 py-5 text-right font-black",
                        amountVal > 0 ? "text-emerald-600" : "text-brand-error"
                      )}
                    >
                      {amountVal > 0 ? "+" : ""}
                      {amountVal.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            statusLabel === "Completed"
                              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                              : "bg-slate-300"
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-bold",
                            statusLabel === "Completed"
                              ? "text-emerald-600"
                              : "text-slate-400"
                          )}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
