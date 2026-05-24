import {
  LayoutDashboard,
  ReceiptText,
  BarChart3,
  Settings,
  Plus,
} from "lucide-react";

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-outline-variant/20 flex justify-around py-3 px-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe-offset-3">
      <button className="flex flex-col items-center gap-1 text-outline">
        <LayoutDashboard size={20} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">
          Dash
        </span>
      </button>
      <button className="flex flex-col items-center gap-1 text-primary">
        <ReceiptText size={20} strokeWidth={3} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">
          Trans
        </span>
      </button>

      <button className="bg-primary text-on-primary -mt-8 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-white active:scale-95 transition-transform">
        <Plus size={24} strokeWidth={3} />
      </button>

      <button className="flex flex-col items-center gap-1 text-outline">
        <BarChart3 size={20} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">
          Stats
        </span>
      </button>
      <button className="flex flex-col items-center gap-1 text-outline">
        <Settings size={20} />
        <span className="text-[10px] font-bold uppercase tracking-tighter">
          Setup
        </span>
      </button>
    </nav>
  );
}
