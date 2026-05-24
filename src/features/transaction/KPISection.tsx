export default function KPISection() {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
          Transactions
        </h2>
        <p className="text-on-surface-variant mt-2 font-medium">
          Review and manage your enterprise cash flow across all accounts.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="bg-primary-fixed p-4 px-6 rounded-xl border-l-4 border-primary shadow-sm min-w-[200px]">
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
            Monthly Volume
          </span>
          <div className="text-2xl font-black text-primary mt-1 font-headline">
            $1,248,390.00
          </div>
        </div>
        <div className="bg-tertiary-fixed p-4 px-6 rounded-xl border-l-4 border-tertiary shadow-sm min-w-[140px]">
          <span className="text-[10px] uppercase tracking-widest text-tertiary font-bold">
            Flagged Items
          </span>
          <div className="text-2xl font-black text-tertiary mt-1 font-headline">
            14
          </div>
        </div>
      </div>
    </div>
  );
}
