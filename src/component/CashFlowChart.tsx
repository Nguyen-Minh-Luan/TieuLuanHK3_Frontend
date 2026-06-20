import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface CashFlowPoint {
  name: string;
  actual: number;
  projected: number;
}

interface CashFlowChartProps {
  data: CashFlowPoint[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-xl font-black text-brand-text font-display">
            Cash Flow Analysis
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            Projected vs Actuals for the last 6 months
          </p>
        </div>
        <div className="flex bg-slate-50 p-1 rounded-full border border-slate-200">
          <button className="px-5 py-1.5 text-xs font-bold bg-brand-primary text-white rounded-full shadow-sm">
            6M
          </button>
          <button className="px-5 py-1.5 text-xs font-bold text-slate-500 hover:text-brand-primary transition-colors">
            1Y
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
              dy={15}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                padding: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#003178"
              strokeWidth={4}
              dot={false}
              animationDuration={2000}
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke="#cbd5e1"
              strokeWidth={2}
              strokeDasharray="8 6"
              dot={false}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
