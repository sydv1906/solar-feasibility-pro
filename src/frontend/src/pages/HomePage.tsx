import {
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  CheckCircle,
  ExternalLink,
  Globe,
  MapPin,
  Shield,
  Sun,
  TrendingUp,
  Zap,
} from "lucide-react";

interface HomePageProps {
  onStart: () => void;
}

export function HomePage({ onStart }: HomePageProps) {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-[#0B1F3B] via-[#0A2A4A] to-[#0D1B2E] pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#F4A62A]/10 border border-[#F4A62A]/30 rounded-full px-4 py-1.5">
                <Sun className="w-4 h-4 text-[#F4A62A]" />
                <span className="text-[#F4A62A] text-sm font-medium">
                  AI-Powered Solar Analytics
                </span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                Precision <span className="text-[#F4A62A]">Solar Power</span>{" "}
                Prediction
              </h1>
              <p className="text-[#C7D1DC] text-lg leading-relaxed">
                Analyze and predict solar energy potential for any location. Get
                instant feasibility scores powered by machine learning.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={onStart}
                  className="flex items-center justify-center gap-2 bg-[#F4A62A] hover:bg-[#F7B84A] text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-[#F4A62A]/25"
                >
                  <Zap className="w-5 h-5" />
                  Start Analysis
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={onStart}
                  className="flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/5 font-semibold py-4 px-8 rounded-xl transition-all"
                >
                  <BarChart3 className="w-5 h-5" />
                  View Dashboard
                </button>
              </div>
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10">
                <div>
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-[#C7D1DC] text-sm">Training Samples</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">92.3%</div>
                  <div className="text-[#C7D1DC] text-sm">Model Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">3</div>
                  <div className="text-[#C7D1DC] text-sm">Key Features</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <SolarIllustration />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F6F8FB] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1F2937] mb-4">
              Everything You Need to Go Solar
            </h2>
            <p className="text-[#6B7280] text-lg">
              Comprehensive analysis tools to make informed solar installation
              decisions
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MapPin className="w-6 h-6" />}
              title="Location Analysis"
              description="Enter any city or coordinates to instantly analyze solar potential based on geographic and climate factors."
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="ML Predictions"
              description="Our Linear Regression model trained on 500 samples predicts power output with 92.3% accuracy."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Feasibility Scoring"
              description="Get an instant Excellent / Moderate / Poor rating with detailed recommendations for your site."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Interactive Charts"
              description="Visualize irradiance, temperature, and humidity correlations with power output through rich analytics."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Map Visualization"
              description="See your selected location on an interactive map with prediction overlays and markers."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Prediction History"
              description="Track and compare all your previous analyses in a detailed history table for informed decisions."
            />
          </div>
        </div>
      </section>

      {/* Government Subsidies Section */}
      <section className="bg-gradient-to-br from-[#0B2A1A] via-[#0A2A1F] to-[#0B1F0E] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/30 rounded-full px-4 py-1.5 mb-4">
              <BadgeIndianRupee className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">
                Government Initiative
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Solar Subsidies by{" "}
              <span className="text-green-400">Government of India</span>
            </h2>
            <p className="text-[#A8C7B0] text-lg max-w-3xl mx-auto">
              The Indian government offers significant financial assistance for
              rooftop solar installations under the{" "}
              <span className="text-green-300 font-semibold">
                PM Surya Ghar Muft Bijli Yojana
              </span>{" "}
              scheme, launched in 2024.
            </p>
          </div>

          {/* Main Scheme Banner */}
          <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/30 rounded-2xl p-6 mb-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="w-16 h-16 bg-green-400/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sun className="w-8 h-8 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">
                  PM Surya Ghar: Muft Bijli Yojana
                </h3>
                <p className="text-[#A8C7B0] text-sm mb-3">
                  Launched February 2024 | Target: 1 crore households | Budget:
                  ₹75,021 crore
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    "Up to 300 units FREE electricity/month",
                    "Subsidy up to ₹78,000",
                    "1 crore homes targeted",
                    "Grid-connected rooftop systems",
                  ].map((badge) => (
                    <span
                      key={badge}
                      className="flex items-center gap-1.5 bg-green-400/10 border border-green-400/20 text-green-300 text-xs px-3 py-1.5 rounded-full"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
              <a
                href="https://pmsuryaghar.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors flex-shrink-0"
              >
                Apply Now <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Subsidy Rate Table + State subsidies */}
          <div className="grid lg:grid-cols-2 gap-8 mb-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <BadgeIndianRupee className="w-5 h-5 text-green-400" />
                Central Financial Assistance (CFA) Rates
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2.5 text-[#A8C7B0] font-medium">
                        System Capacity
                      </th>
                      <th className="text-left py-2.5 text-[#A8C7B0] font-medium">
                        CFA per kW
                      </th>
                      <th className="text-left py-2.5 text-[#A8C7B0] font-medium">
                        Max Subsidy
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      {
                        capacity: "Up to 2 kW",
                        rate: "₹30,000/kW",
                        max: "₹60,000",
                      },
                      {
                        capacity: "2 kW – 3 kW",
                        rate: "₹18,000/kW",
                        max: "₹78,000",
                      },
                      {
                        capacity: "3 kW – 10 kW",
                        rate: "₹9,000/kW",
                        max: "₹1,35,000",
                      },
                      {
                        capacity: "Above 10 kW",
                        rate: "Not applicable",
                        max: "—",
                      },
                    ].map((row) => (
                      <tr key={row.capacity}>
                        <td className="py-3 text-white font-medium">
                          {row.capacity}
                        </td>
                        <td className="py-3 text-green-300">{row.rate}</td>
                        <td className="py-3 text-yellow-300 font-semibold">
                          {row.max}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-[#A8C7B0] mt-4">
                * For residential (household) grid-connected rooftop solar
                systems only. Additional state-level subsidies may apply.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                State-wise Additional Subsidies
              </h3>
              <div className="space-y-2.5">
                {[
                  {
                    state: "Gujarat",
                    subsidy: "Up to ₹10,000 additional",
                    color: "text-blue-300",
                  },
                  {
                    state: "Rajasthan",
                    subsidy: "Up to ₹15,000 additional",
                    color: "text-purple-300",
                  },
                  {
                    state: "Maharashtra",
                    subsidy: "Up to ₹12,000 additional",
                    color: "text-pink-300",
                  },
                  {
                    state: "Uttar Pradesh",
                    subsidy: "Special incentive + net metering",
                    color: "text-orange-300",
                  },
                  {
                    state: "Madhya Pradesh",
                    subsidy: "Up to ₹10,000 additional",
                    color: "text-green-300",
                  },
                  {
                    state: "Tamil Nadu",
                    subsidy: "Additional ₹20,000 for BPL households",
                    color: "text-cyan-300",
                  },
                  {
                    state: "Karnataka",
                    subsidy: "Net metering + accelerated depreciation",
                    color: "text-red-300",
                  },
                  {
                    state: "Delhi",
                    subsidy: "Generation-based incentive ₹2/kWh",
                    color: "text-amber-300",
                  },
                ].map((item) => (
                  <div
                    key={item.state}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <span className="text-white text-sm font-medium">
                      {item.state}
                    </span>
                    <span className={`text-xs ${item.color}`}>
                      {item.subsidy}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#A8C7B0] mt-4">
                * State subsidies vary. Check with your state DISCOM.
              </p>
            </div>
          </div>

          {/* How to Apply */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              How to Apply for PM Surya Ghar Subsidy
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                {
                  step: "1",
                  title: "Register Online",
                  desc: "Visit pmsuryaghar.gov.in and register with your electricity consumer number and Aadhaar.",
                },
                {
                  step: "2",
                  title: "Choose Installer",
                  desc: "Select a MNRE-empanelled vendor from the portal for your area.",
                },
                {
                  step: "3",
                  title: "Installation",
                  desc: "The vendor installs the system and applies for net meter with your DISCOM.",
                },
                {
                  step: "4",
                  title: "Get Subsidy",
                  desc: "After net meter installation, the CFA amount is directly credited to your bank account.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center text-green-400 font-bold text-lg mx-auto mb-3">
                    {item.step}
                  </div>
                  <h4 className="text-white font-semibold text-sm mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[#A8C7B0] text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[#A8C7B0] text-sm">
                Helpline:{" "}
                <span className="text-white font-medium">1800-180-3333</span>{" "}
                (Toll Free) | Email:{" "}
                <span className="text-white font-medium">
                  support@pmsuryaghar.gov.in
                </span>
              </p>
              <a
                href="https://pmsuryaghar.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-green-500/50 text-green-400 hover:bg-green-500/10 font-medium px-4 py-2 rounded-xl text-sm transition-colors"
              >
                Official Website <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#0B1F3B] to-[#0A2A4A] py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <Sun className="w-12 h-12 text-[#F4A62A] mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Analyze Your Location?
          </h2>
          <p className="text-[#C7D1DC] text-lg mb-8">
            Get a complete solar feasibility report in seconds.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="bg-[#F4A62A] hover:bg-[#F7B84A] text-white font-bold py-4 px-10 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-[#F4A62A]/25 text-lg"
          >
            Start Free Analysis
          </button>
        </div>
      </section>

      <footer className="bg-[#061221] py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <div className="w-7 h-7 rounded-full bg-[#F4A62A] flex items-center justify-center">
              <Sun className="w-4 h-4 text-white" />
            </div>
            <span>
              Solar<span className="text-[#F4A62A]">Wise</span>
            </span>
          </div>
          <p className="text-[#6B7280] text-sm">
            Solar Installation Feasibility &amp; Power Prediction System &copy;
            2026
          </p>
          <div className="flex gap-4 text-[#C7D1DC] text-sm">
            <span>Powered by ML</span>
            <span>|</span>
            <span>Linear Regression</span>
            <span>|</span>
            <span>R&sup2; = 0.923</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-[#E6EAF0] hover:shadow-md transition-all">
      <div className="w-12 h-12 bg-[#FEF3C7] rounded-xl flex items-center justify-center text-[#F4A62A] mb-4">
        {icon}
      </div>
      <h3 className="text-[#1F2937] font-semibold text-lg mb-2">{title}</h3>
      <p className="text-[#6B7280] text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function SolarIllustration() {
  return (
    <svg
      viewBox="0 0 480 400"
      className="w-full max-w-lg"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Solar house illustration</title>
      <rect width="480" height="400" rx="16" fill="#0D3460" />
      <circle cx="360" cy="100" r="55" fill="#F4A62A" opacity="0.9" />
      <circle cx="360" cy="100" r="70" fill="#F4A62A" opacity="0.2" />
      <circle cx="360" cy="100" r="85" fill="#F4A62A" opacity="0.1" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1={360 + 58 * Math.cos((angle * Math.PI) / 180)}
          y1={100 + 58 * Math.sin((angle * Math.PI) / 180)}
          x2={360 + 78 * Math.cos((angle * Math.PI) / 180)}
          y2={100 + 78 * Math.sin((angle * Math.PI) / 180)}
          stroke="#F7B84A"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      <ellipse cx="120" cy="80" rx="50" ry="22" fill="white" opacity="0.15" />
      <ellipse cx="150" cy="70" rx="40" ry="20" fill="white" opacity="0.15" />
      <rect x="0" y="290" width="480" height="110" fill="#0A4A0A" />
      <rect x="0" y="285" width="480" height="15" fill="#0D5C0D" />
      <rect x="120" y="180" width="200" height="130" fill="#1E3A5F" />
      <polygon points="100,185 220,110 340,185" fill="#152D4A" />
      <rect x="195" y="255" width="50" height="55" rx="4" fill="#0B1F3B" />
      <circle cx="238" cy="285" r="3" fill="#F4A62A" />
      <rect
        x="135"
        y="210"
        width="45"
        height="40"
        rx="4"
        fill="#F4A62A"
        opacity="0.6"
      />
      <rect
        x="260"
        y="210"
        width="45"
        height="40"
        rx="4"
        fill="#F4A62A"
        opacity="0.6"
      />
      <rect
        x="155"
        y="128"
        width="28"
        height="18"
        rx="2"
        fill="#1D6FD6"
        stroke="#3BA3F5"
        strokeWidth="0.5"
      />
      <rect
        x="186"
        y="122"
        width="28"
        height="18"
        rx="2"
        fill="#1D6FD6"
        stroke="#3BA3F5"
        strokeWidth="0.5"
      />
      <rect
        x="217"
        y="116"
        width="28"
        height="18"
        rx="2"
        fill="#1D6FD6"
        stroke="#3BA3F5"
        strokeWidth="0.5"
      />
      <rect
        x="248"
        y="122"
        width="28"
        height="18"
        rx="2"
        fill="#1D6FD6"
        stroke="#3BA3F5"
        strokeWidth="0.5"
      />
      <rect
        x="165"
        y="148"
        width="28"
        height="18"
        rx="2"
        fill="#1D6FD6"
        stroke="#3BA3F5"
        strokeWidth="0.5"
      />
      <rect
        x="196"
        y="142"
        width="28"
        height="18"
        rx="2"
        fill="#1D6FD6"
        stroke="#3BA3F5"
        strokeWidth="0.5"
      />
      <rect
        x="227"
        y="136"
        width="28"
        height="18"
        rx="2"
        fill="#1D6FD6"
        stroke="#3BA3F5"
        strokeWidth="0.5"
      />
      <rect x="55" y="240" width="10" height="50" fill="#2D4A1E" />
      <ellipse cx="60" cy="225" rx="28" ry="32" fill="#2D6A1E" />
      <ellipse cx="60" cy="210" rx="22" ry="25" fill="#3A7A28" />
      <rect x="380" y="255" width="10" height="40" fill="#2D4A1E" />
      <ellipse cx="385" cy="240" rx="24" ry="28" fill="#2D6A1E" />
      <line
        x1="305"
        y1="110"
        x2="280"
        y2="140"
        stroke="#F4A62A"
        strokeWidth="1.5"
        strokeDasharray="4,3"
        opacity="0.6"
      />
      <line
        x1="310"
        y1="120"
        x2="260"
        y2="150"
        stroke="#F4A62A"
        strokeWidth="1.5"
        strokeDasharray="4,3"
        opacity="0.6"
      />
      <line
        x1="315"
        y1="130"
        x2="240"
        y2="155"
        stroke="#F4A62A"
        strokeWidth="1.5"
        strokeDasharray="4,3"
        opacity="0.6"
      />
    </svg>
  );
}
