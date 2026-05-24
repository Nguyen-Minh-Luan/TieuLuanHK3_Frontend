import { ShoppingCart, Banknote, Plane, Utensils, Filter } from "lucide-react";
import { cn } from "../lib/utils";

const transactions = [
  {
    id: 1,
    date: "Oct 24, 2023",
    description: "Apple Store Corporate",
    category: "Equipment",
    amount: -2499.0,
    status: "Completed",
    icon: ShoppingCart,
    iconColor: "bg-orange-100 text-orange-600",
  },
  {
    id: 2,
    date: "Oct 23, 2023",
    description: "Client: Global Tech Ltd",
    category: "Invoicing",
    amount: 12000.0,
    status: "Completed",
    icon: Banknote,
    iconColor: "bg-blue-100 text-blue-600",
  },
  {
    id: 3,
    date: "Oct 22, 2023",
    description: "Lufthansa Airlines",
    category: "Travel",
    amount: -840.12,
    status: "Pending",
    icon: Plane,
    iconColor: "bg-slate-100 text-slate-600",
  },
  {
    id: 4,
    date: "Oct 21, 2023",
    description: "The Capital Grille",
    category: "Meals",
    amount: -312.45,
    status: "Completed",
    icon: Utensils,
    iconColor: "bg-rose-100 text-rose-600",
  },
];

export function TransactionsData() {
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
            {transactions.map((t) => (
              <tr
                key={t.id}
                className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
              >
                <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                  {t.date}
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${t.iconColor} transition-transform group-hover:scale-110`}
                    >
                      <t.icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                      {t.description}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-tight">
                    {t.category}
                  </span>
                </td>
                <td
                  className={cn(
                    "px-8 py-5 text-right font-black",
                    t.amount > 0 ? "text-emerald-600" : "text-brand-error",
                  )}
                >
                  {t.amount > 0 ? "+" : ""}
                  {t.amount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        t.status === "Completed"
                          ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                          : "bg-slate-300",
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-bold",
                        t.status === "Completed"
                          ? "text-emerald-600"
                          : "text-slate-400",
                      )}
                    >
                      {t.status}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
