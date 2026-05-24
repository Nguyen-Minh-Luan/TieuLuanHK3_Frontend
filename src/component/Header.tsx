import { Search, Bell, Settings } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 w-full z-40 glass-header flex justify-between items-center h-16 px-6 border-b border-outline-variant/20 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-black text-blue-900 font-headline md:hidden">
          LP
        </span>
        <div className="hidden md:flex items-center bg-surface-container-high px-4 py-2 rounded-full w-96 group focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <Search
            size={18}
            className="text-outline group-focus-within:text-primary"
          />
          <input
            type="text"
            placeholder="Search transactions, accounts, or vendors..."
            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-outline/70 ml-2"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all">
          <Settings size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-surface-container-highest overflow-hidden ml-2 ring-2 ring-primary/5 cursor-pointer hover:ring-primary/20 transition-all">
          <img
            alt="User avatar"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
