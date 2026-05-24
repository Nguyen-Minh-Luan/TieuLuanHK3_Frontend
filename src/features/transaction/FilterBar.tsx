import { SlidersHorizontal, CalendarDays, RefreshCw } from "lucide-react";

export default function FilterBar() {
  return (
    <section className="bg-surface-container-low rounded-2xl p-6 shadow-sm border border-outline-variant/10 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <SlidersHorizontal size={18} className="text-primary" />
        <h3 className="font-headline font-bold text-lg text-on-surface">
          Advanced Filters
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-outline uppercase tracking-wider block">
            Date Range
          </label>
          <div className="relative">
            <input
              type="text"
              readOnly
              value="Last 30 Days"
              className="w-full bg-white border-none rounded-xl py-3 px-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary/20 cursor-pointer"
            />
            <CalendarDays
              size={16}
              className="absolute right-3 top-3.5 text-outline"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-outline uppercase tracking-wider block">
            Category
          </label>
          <select className="w-full bg-white border-none rounded-xl py-3 px-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary/20 appearance-none">
            <option>All Categories</option>
            <option>Operational Expense</option>
            <option>Payroll</option>
            <option>Software Subscription</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-outline uppercase tracking-wider block">
            Payment Method
          </label>
          <select className="w-full bg-white border-none rounded-xl py-3 px-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary/20 appearance-none">
            <option>All Methods</option>
            <option>Corporate Card (6602)</option>
            <option>ACH Transfer</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-outline uppercase tracking-wider block">
            Status
          </label>
          <div className="flex gap-2">
            <select className="w-full bg-white border-none rounded-xl py-3 px-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary/20 appearance-none">
              <option>All Statuses</option>
              <option>Completed</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
            <button className="bg-primary text-on-primary min-w-[48px] h-[48px] flex items-center justify-center rounded-xl shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
