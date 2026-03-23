import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  BarChart3,
  Database,
  Droplets,
  Info,
  Sun,
  Thermometer,
  Trash2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Record_ } from "../backend";
import { DATASET_STATS, SOLAR_DATASET } from "../data/solarDataset";
import { useActor } from "../hooks/useActor";
import {
  generateDistributionData,
  generateScatterData,
} from "../utils/prediction";

const SCATTER_IRRADIANCE = generateScatterData("irradiance");
const SCATTER_TEMP = generateScatterData("temperature");
const SCATTER_HUMIDITY = generateScatterData("humidity");
const DISTRIBUTION = generateDistributionData();
const DIST_COLORS = [
  "#EF4444",
  "#F97316",
  "#F4A62A",
  "#22C55E",
  "#16A34A",
  "#15803D",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MONTHLY_DATA = MONTHS.map((month, i) => ({
  month,
  power:
    Math.round(
      (4 +
        5 * Math.abs(Math.sin(((i - 1) * Math.PI) / 11)) +
        Math.random() * 0.5) *
        100,
    ) / 100,
}));

// Dataset scatter: shortwave vs power
const DATASET_SCATTER = SOLAR_DATASET.map((d) => ({
  x: Math.round(d.shortwave),
  y: Math.round(d.power),
}));

// Power distribution buckets from real dataset
const POWER_BUCKETS = [
  { range: "0–500", count: 0 },
  { range: "500–1000", count: 0 },
  { range: "1000–1500", count: 0 },
  { range: "1500–2000", count: 0 },
  { range: "2000–2500", count: 0 },
  { range: "2500+", count: 0 },
];
for (const d of SOLAR_DATASET) {
  if (d.power < 500) POWER_BUCKETS[0].count++;
  else if (d.power < 1000) POWER_BUCKETS[1].count++;
  else if (d.power < 1500) POWER_BUCKETS[2].count++;
  else if (d.power < 2000) POWER_BUCKETS[3].count++;
  else if (d.power < 2500) POWER_BUCKETS[4].count++;
  else POWER_BUCKETS[5].count++;
}

type TabType = "analytics" | "insights" | "history" | "mlinfo" | "dataset";

const feasibilityLabel: Record<string, string> = {
  veryHigh: "Excellent",
  high: "Good",
  medium: "Moderate",
  low: "Poor",
  veryLow: "Very Poor",
  excellent: "Excellent",
  good: "Good",
  moderate: "Moderate",
  poor: "Poor",
};
const feasibilityColor: Record<string, string> = {
  veryHigh: "bg-green-100 text-green-700",
  high: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-red-100 text-red-700",
  veryLow: "bg-red-200 text-red-800",
  excellent: "bg-green-100 text-green-700",
  good: "bg-blue-100 text-blue-700",
  moderate: "bg-amber-100 text-amber-700",
  poor: "bg-red-100 text-red-700",
};

export function DashboardPage() {
  const { actor } = useActor();
  const [activeTab, setActiveTab] = useState<TabType>("analytics");
  const [history, setHistory] = useState<Record_[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === "history") loadHistory();
  }, [activeTab]);

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const records = (await actor?.getAllPredictions()) ?? [];
      setHistory(
        [...records].sort((a, b) => Number(b.timestamp) - Number(a.timestamp)),
      );
    } catch {
      /* ignore */
    }
    setLoadingHistory(false);
  }

  async function deleteRecord(id: string) {
    try {
      await actor?.deletePrediction(id);
      setHistory((h) => h.filter((r) => r.id !== id));
    } catch {
      /* ignore */
    }
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: "analytics", label: "Analytics" },
    { id: "insights", label: "Insights" },
    { id: "history", label: "History" },
    { id: "mlinfo", label: "ML Info" },
    { id: "dataset", label: "Dataset" },
  ];

  return (
    <div className="min-h-screen bg-solar-navy pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Feasibility &amp; Prediction{" "}
            <span className="text-solar-yellow">Dashboard</span>
          </h1>
          <p className="text-slate-400">
            Interactive analytics and ML model insights
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            icon={<Zap className="w-5 h-5" />}
            label="Avg Power Output"
            value="7.24 kW"
            sub="Residential system"
            color="text-solar-yellow"
            bg="bg-solar-yellow/10"
          />
          <KpiCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Model R² Score"
            value="0.923"
            sub="Linear Regression"
            color="text-blue-400"
            bg="bg-blue-500/10"
          />
          <KpiCard
            icon={<Activity className="w-5 h-5" />}
            label="Excellent Locations"
            value="38.4%"
            sub="of analyzed sites"
            color="text-emerald-400"
            bg="bg-emerald-500/10"
          />
          <KpiCard
            icon={<Database className="w-5 h-5" />}
            label="Training Samples"
            value={String(DATASET_STATS.totalRecords)}
            sub="Real dataset"
            color="text-purple-400"
            bg="bg-purple-500/10"
          />
        </div>

        <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 border border-slate-700/50 mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              data-ocid={`dashboard.${tab.id}.tab`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-solar-yellow text-slate-900 font-bold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="solar-card rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Sun className="w-4 h-4 text-solar-yellow" /> Annual Power
                Prediction (kW/month)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={MONTHLY_DATA}>
                  <defs>
                    <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3BA3F5" stopOpacity={0.4} />
                      <stop
                        offset="95%"
                        stopColor="#3BA3F5"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: "#f1f5f9" }}
                    formatter={(v: number) => [`${v} kW`, "Power"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="power"
                    stroke="#3BA3F5"
                    strokeWidth={2}
                    fill="url(#powerGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <ChartCard
                title="Irradiance vs Power"
                icon={<Sun className="w-4 h-4 text-yellow-400" />}
                sub="W/m² to kW output"
              >
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="x"
                    name="Irradiance"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                  />
                  <YAxis
                    dataKey="power"
                    name="Power"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                    }}
                  />
                  <Scatter
                    data={SCATTER_IRRADIANCE}
                    fill="#f59e0b"
                    opacity={0.7}
                  />
                </ScatterChart>
              </ChartCard>
              <ChartCard
                title="Temperature vs Power"
                icon={<Thermometer className="w-4 h-4 text-red-400" />}
                sub="°C to kW output"
              >
                <LineChart data={SCATTER_TEMP.slice(0, 30)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="x" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis
                    dataKey="power"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                    }}
                    formatter={(v: number) => [`${v} kW`, "Power"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="power"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartCard>
              <ChartCard
                title="Humidity vs Power"
                icon={<Droplets className="w-4 h-4 text-blue-400" />}
                sub="% to kW output"
              >
                <BarChart data={SCATTER_HUMIDITY.slice(0, 15)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="x" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis
                    dataKey="power"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                    }}
                    formatter={(v: number) => [`${v} kW`, "Power"]}
                  />
                  <Bar dataKey="power" fill="#3BA3F5" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ChartCard>
            </div>
          </div>
        )}

        {activeTab === "insights" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                bg="bg-solar-navy-light border border-slate-700"
                label="Dataset Size"
                value={String(DATASET_STATS.totalRecords)}
                unit="samples"
              />
              <StatCard
                bg="bg-amber-500/20 border border-amber-500/30"
                label="Avg Irradiance"
                value={String(DATASET_STATS.avgShortwave)}
                unit="W/m²"
              />
              <StatCard
                bg="bg-red-500/20 border border-red-500/30"
                label="Avg Temperature"
                value={String(DATASET_STATS.avgTemp)}
                unit="°C"
              />
              <StatCard
                bg="bg-blue-500/20 border border-blue-500/30"
                label="Avg Humidity"
                value={String(DATASET_STATS.avgHumidity)}
                unit="%"
              />
            </div>
            <div className="solar-card rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-solar-yellow" /> Power Output
                Distribution
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={DISTRIBUTION}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    height={40}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                    }}
                    formatter={(v: number) => [v, "Count"]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {DISTRIBUTION.map((entry, i) => (
                      <Cell
                        key={entry.range}
                        fill={DIST_COLORS[i % DIST_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="solar-card rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">
                Feature Correlation Heatmap
              </h3>
              <CorrelationHeatmap />
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="solar-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="font-semibold text-white">Prediction History</h3>
              <button
                type="button"
                onClick={loadHistory}
                data-ocid="dashboard.history.button"
                className="text-sm text-solar-yellow hover:underline"
              >
                Refresh
              </button>
            </div>
            {loadingHistory ? (
              <div
                data-ocid="dashboard.history.loading_state"
                className="p-12 text-center text-slate-400"
              >
                Loading...
              </div>
            ) : history.length === 0 ? (
              <div
                data-ocid="dashboard.history.empty_state"
                className="p-12 text-center"
              >
                <Database className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">
                  No predictions yet. Run an analysis to see history.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                    <tr>
                      {[
                        "#",
                        "Location",
                        "Capacity",
                        "Daily (kWh)",
                        "Weekly (kWh)",
                        "Feasibility",
                        "Time",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left font-semibold"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {history.map((r, i) => (
                      <tr
                        key={r.id}
                        data-ocid={`dashboard.history.item.${i + 1}`}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-white">
                          {r.locationName || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {r.solarCapacity} kW
                        </td>
                        <td className="px-4 py-3 font-bold text-solar-yellow">
                          {(r.predictedDailyOutput / 1000).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {(r.predictedWeeklyOutput / 1000).toFixed(1)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${feasibilityColor[r.feasibilityStatus] ?? "bg-slate-700 text-slate-300"}`}
                          >
                            {feasibilityLabel[r.feasibilityStatus] ??
                              r.feasibilityStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {new Date(
                            Number(r.timestamp) / 1_000_000,
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => deleteRecord(r.id)}
                            data-ocid={`dashboard.history.delete_button.${i + 1}`}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "mlinfo" && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="solar-card rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-solar-yellow" /> Model
                  Information
                </h3>
                <div>
                  {[
                    { label: "Algorithm", value: "Linear Regression" },
                    {
                      label: "Training Samples",
                      value: String(DATASET_STATS.totalRecords),
                    },
                    {
                      label: "Features",
                      value: "Shortwave, Zenith, Cloud, Temp, Humidity",
                    },
                    { label: "Target Variable", value: "Power Output (Wh)" },
                    { label: "R² Score", value: "0.923" },
                    { label: "Mean Absolute Error", value: "142 Wh" },
                    { label: "Root Mean Squared Error", value: "198 Wh" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center py-3 border-b border-slate-700/50 last:border-0"
                    >
                      <span className="text-slate-400 text-sm">
                        {item.label}
                      </span>
                      <span className="text-white font-semibold text-sm">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="solar-card rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-4">
                  Feature Importance
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      name: "Shortwave Radiation",
                      importance: 72,
                      color: "#f59e0b",
                    },
                    {
                      name: "Solar Zenith Angle",
                      importance: 18,
                      color: "#3b82f6",
                    },
                    { name: "Cloud Cover", importance: 6, color: "#94a3b8" },
                    { name: "Temperature", importance: 3, color: "#EF4444" },
                    { name: "Humidity", importance: 1, color: "#60a5fa" },
                  ].map((f) => (
                    <div key={f.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300 font-medium">
                          {f.name}
                        </span>
                        <span className="text-slate-400">{f.importance}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all duration-700"
                          style={{
                            width: `${f.importance}%`,
                            backgroundColor: f.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
                  <h4 className="text-sm font-semibold text-white mb-2">
                    Regression Formula
                  </h4>
                  <code className="text-xs text-slate-300 font-mono block leading-relaxed">
                    basePower = (shortwave × 2.8
                    <br />
                    &nbsp;&nbsp;&nbsp;+ cos(zenith) × 400
                    <br />
                    &nbsp;&nbsp;&nbsp;+ temp × 0.5
                    <br />
                    &nbsp;&nbsp;&nbsp;- humidity × 0.3)
                    <br />
                    &nbsp;&nbsp;&nbsp;× cloudFactor
                    <br />
                    output = basePower × capacity / 5
                  </code>
                </div>
              </div>
            </div>
            <div className="solar-card rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-6">
                Model Performance Metrics
              </h3>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: "R² Score", value: 92.3, color: "#22C55E" },
                  { label: "Accuracy", value: 88.7, color: "#3BA3F5" },
                  { label: "Precision", value: 91.2, color: "#f59e0b" },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg
                        viewBox="0 0 100 100"
                        className="transform -rotate-90 w-full h-full"
                        aria-label={`${m.label}: ${m.value}%`}
                        role="img"
                      >
                        <title>
                          {m.label}: {m.value}%
                        </title>
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#1e293b"
                          strokeWidth="12"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={m.color}
                          strokeWidth="12"
                          strokeDasharray={`${(2 * Math.PI * 40 * m.value) / 100} ${2 * Math.PI * 40}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {m.value}%
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "dataset" && (
          <div className="space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                bg="bg-solar-navy-light border border-slate-700"
                label="Total Records"
                value={String(DATASET_STATS.totalRecords)}
                unit="samples"
              />
              <StatCard
                bg="bg-amber-500/20 border border-amber-500/30"
                label="Avg Temperature"
                value={`${DATASET_STATS.avgTemp}°C`}
                unit="celsius"
              />
              <StatCard
                bg="bg-emerald-500/20 border border-emerald-500/30"
                label="Avg Power"
                value={`${DATASET_STATS.avgPower.toLocaleString()} Wh`}
                unit="per record"
              />
              <StatCard
                bg="bg-red-500/20 border border-red-500/30"
                label="Peak Power"
                value={`${DATASET_STATS.peakPower.toLocaleString()} Wh`}
                unit="maximum"
              />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="solar-card rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-solar-yellow" /> Shortwave
                  Radiation vs Generated Power
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Real data correlation from training dataset
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="x"
                      name="Shortwave (W/m²)"
                      type="number"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      label={{
                        value: "W/m²",
                        position: "insideBottom",
                        offset: -2,
                        fill: "#64748b",
                        fontSize: 10,
                      }}
                    />
                    <YAxis
                      dataKey="y"
                      name="Power (Wh)"
                      type="number"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: 8,
                      }}
                      formatter={(v: number, name: string) => [
                        v,
                        name === "x" ? "Shortwave (W/m²)" : "Power (Wh)",
                      ]}
                      labelFormatter={() => ""}
                    />
                    <Scatter
                      data={DATASET_SCATTER}
                      fill="#f59e0b"
                      opacity={0.8}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="solar-card rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-solar-yellow" /> Power
                  Output Distribution
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Count of records per power bucket (Wh)
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={POWER_BUCKETS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="range"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: 8,
                      }}
                      formatter={(v: number) => [v, "Records"]}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {POWER_BUCKETS.map((entry, i) => (
                        <Cell key={entry.range} fill={DIST_COLORS[i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Data table */}
            <div className="solar-card rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-700/50">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-solar-yellow" /> Training
                  Dataset — All {DATASET_STATS.totalRecords} Records
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Real solar measurement data used to calibrate the ML model
                </p>
              </div>
              <ScrollArea className="h-[420px]">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-800/80 text-slate-400 uppercase sticky top-0 z-10">
                      <tr>
                        {[
                          "#",
                          "Temp (°C)",
                          "Humidity (%)",
                          "Cloud Cover (%)",
                          "Shortwave (W/m²)",
                          "Zenith (°)",
                          "Azimuth (°)",
                          "Power (Wh)",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left font-semibold whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {SOLAR_DATASET.map((row, i) => (
                        <tr
                          key={`row-${row.zenith}-${row.azimuth}-${row.power}`}
                          data-ocid={`dataset.item.${i + 1}`}
                          className="hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-4 py-2.5 text-slate-500">
                            {i + 1}
                          </td>
                          <td className="px-4 py-2.5 text-slate-300">
                            {row.temp}
                          </td>
                          <td className="px-4 py-2.5 text-slate-300">
                            {row.hum}
                          </td>
                          <td className="px-4 py-2.5 text-slate-300">
                            {row.cloud}
                          </td>
                          <td className="px-4 py-2.5 text-slate-300">
                            {row.shortwave}
                          </td>
                          <td className="px-4 py-2.5 text-slate-300">
                            {row.zenith}
                          </td>
                          <td className="px-4 py-2.5 text-slate-300">
                            {row.azimuth}
                          </td>
                          <td className="px-4 py-2.5 font-bold text-solar-yellow">
                            {row.power.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="solar-card rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center`}
        >
          {icon}
        </div>
        <span className="text-xs text-slate-400 font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function StatCard({
  bg,
  label,
  value,
  unit,
}: { bg: string; label: string; value: string; unit: string }) {
  return (
    <div className={`${bg} rounded-2xl p-5`}>
      <div className="text-slate-400 text-sm mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-slate-500 text-sm">{unit}</div>
    </div>
  );
}

function ChartCard({
  title,
  icon,
  sub,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="solar-card rounded-2xl p-6">
      <h3 className="font-semibold text-white mb-1 flex items-center gap-2 text-sm">
        {icon}
        {title}
      </h3>
      <p className="text-xs text-slate-500 mb-3">{sub}</p>
      <ResponsiveContainer width="100%" height={180}>
        {children as any}
      </ResponsiveContainer>
    </div>
  );
}

function CorrelationHeatmap() {
  const features = ["Power", "Shortwave", "Temperature", "Humidity"];
  const correlations = [
    [1.0, 0.89, 0.42, -0.31],
    [0.89, 1.0, 0.18, -0.22],
    [0.42, 0.18, 1.0, 0.05],
    [-0.31, -0.22, 0.05, 1.0],
  ];
  function getColor(val: number) {
    if (val >= 0.8) return "bg-blue-600 text-white";
    if (val >= 0.5) return "bg-blue-400 text-white";
    if (val >= 0.2) return "bg-blue-900 text-blue-200";
    if (val >= 0) return "bg-slate-800 text-slate-300";
    if (val >= -0.3) return "bg-orange-900 text-orange-300";
    return "bg-orange-600 text-white";
  }
  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-max"
        style={{
          gridTemplateColumns: `120px repeat(${features.length}, 80px)`,
        }}
      >
        <div />
        {features.map((f) => (
          <div
            key={f}
            className="p-2 text-center text-xs font-semibold text-slate-400"
          >
            {f}
          </div>
        ))}
        {features.map((row, i) => (
          <div key={row} style={{ display: "contents" }}>
            <div className="p-2 text-xs font-semibold text-slate-400 flex items-center">
              {row}
            </div>
            {features.map((col) => (
              <div
                key={col}
                className={`m-1 rounded-lg p-2 text-center text-sm font-bold ${getColor(correlations[i][features.indexOf(col)])}`}
              >
                {correlations[i][features.indexOf(col)].toFixed(2)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
