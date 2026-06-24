import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Map, Brain, Zap, ChevronRight } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { recommendAPI, type SearchResult, type DateRecommendation, type Circuit } from "@/services/recommendAPI";

const DESTINATIONS = [
  "Gangtok", "Tsomgo Lake", "Nathula Pass", "Pelling",
  "Yuksom", "Ravangla", "Namchi", "Lachung", "Lachen",
  "Rumtek Monastery", "Zuluk",
];

const EXAMPLE_QUERIES = [
  "peaceful monastery with mountain views",
  "high altitude lake photography",
  "buddhist temple spiritual",
  "adventure trekking base camp",
  "family friendly nature walk",
  "sunrise viewpoint panoramic",
];

const CROWD_COLORS = {
  Low: { bg: "bg-emerald-500/20", border: "border-emerald-400/40", text: "text-emerald-300", dot: "bg-emerald-400" },
  Medium: { bg: "bg-yellow-500/20", border: "border-yellow-400/40", text: "text-yellow-300", dot: "bg-yellow-400" },
  High: { bg: "bg-red-500/20", border: "border-red-400/40", text: "text-red-300", dot: "bg-red-400" },
};

// ─── Tab definitions ──────────────────────────────────────

const TABS = [
  {
    id: "search",
    label: "NLP Smart Search",
    icon: Search,
    color: "from-cyan-500 to-blue-600",
    badge: "TF-IDF + Cosine Similarity",
    description: "Type anything in plain English — the AI ranks attractions by semantic relevance",
  },
  {
    id: "dates",
    label: "Best Visit Dates",
    icon: Calendar,
    color: "from-purple-500 to-pink-600",
    badge: "Random Forest Classifier",
    description: "ML predicts the next 30 days of crowd levels and surfaces the 5 best dates",
  },
  {
    id: "circuits",
    label: "AI Travel Circuits",
    icon: Map,
    color: "from-orange-500 to-red-500",
    badge: "K-Means Clustering",
    description: "Unsupervised ML groups all destinations into 3 smart travel circuits",
  },
];

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════

export default function SmartRecommend() {
  const [activeTab, setActiveTab] = useState("search");

  // ── NLP Search state ──
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // ── Date finder state ──
  const [destination, setDestination] = useState(DESTINATIONS[1]);
  const [dateResult, setDateResult] = useState<any>(null);
  const [dateLoading, setDateLoading] = useState(false);

  // ── Circuits state ──
  const [circuits, setCircuits] = useState<Record<string, Circuit>>({});
  const [circuitsLoading, setCircuitsLoading] = useState(false);
  const [activeCircuit, setActiveCircuit] = useState<string | null>(null);

  // Load circuits once
  useEffect(() => {
    setCircuitsLoading(true);
    recommendAPI.getCircuits()
      .then((d) => {
        setCircuits(d.circuits);
        const firstKey = Object.keys(d.circuits)[0];
        setActiveCircuit(firstKey);
      })
      .catch(console.error)
      .finally(() => setCircuitsLoading(false));
  }, []);

  const handleSearch = async (q?: string) => {
    const finalQuery = q ?? query;
    if (!finalQuery.trim()) return;
    setQuery(finalQuery);
    setSearchLoading(true);
    setSearchResults([]);
    try {
      const data = await recommendAPI.search(finalQuery);
      setSearchResults(data.results);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDateSearch = async () => {
    setDateLoading(true);
    setDateResult(null);
    try {
      const data = await recommendAPI.getBestDates(destination);
      setDateResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setDateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute top-[30%] right-0 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-orange-500/8 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10">
        <Navbar />

        {/* HERO */}
        <section className="pt-32 pb-16 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-full px-5 py-2 mb-6">
              <Brain size={16} className="text-cyan-400" />
              <span className="text-white/70 text-sm font-medium">3 ML Techniques — One Intelligent System</span>
            </div>

            <h1 className="text-white font-bold text-5xl md:text-6xl mb-4">
              AI Recommendation{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Engine
              </span>
            </h1>
            <p className="text-white/60 text-xl max-w-2xl mx-auto">
              Natural Language Search · Crowd-Optimal Date Prediction · Unsupervised Destination Clustering
            </p>
          </motion.div>
        </section>

        {/* TABS */}
        <div className="px-4 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 text-left p-5 rounded-2xl border transition-all duration-300 ${
                    active
                      ? "bg-white/10 border-white/30 shadow-xl"
                      : "bg-white/3 border-white/10 hover:bg-white/6"
                  }`}
                >
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 bg-gradient-to-r ${tab.color} text-white`}>
                    <Icon size={12} />
                    {tab.badge}
                  </div>
                  <h3 className="text-white font-bold text-base mb-1">{tab.label}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{tab.description}</p>
                </motion.button>
              );
            })}
          </div>

          {/* ══════════════════════════════════════════ */}
          {/* TAB 1: NLP SMART SEARCH                   */}
          {/* ══════════════════════════════════════════ */}
          <AnimatePresence mode="wait">
            {activeTab === "search" && (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Search input */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Brain size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold">Natural Language Search</p>
                      <p className="text-white/40 text-xs">TF-IDF Vectorization + Cosine Similarity — no keywords needed</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder='e.g. "peaceful monastery with mountain views"'
                      className="flex-1 bg-white/5 border border-white/15 rounded-xl px-5 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSearch()}
                      disabled={searchLoading}
                      className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold disabled:opacity-50 flex items-center gap-2"
                    >
                      {searchLoading ? (
                        <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}>
                          <Zap size={16} />
                        </motion.span>
                      ) : (
                        <Search size={16} />
                      )}
                      Search
                    </motion.button>
                  </div>

                  {/* Example queries */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-white/30 text-xs self-center">Try:</span>
                    {EXAMPLE_QUERIES.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSearch(q)}
                        className="text-xs bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-cyan-400/40 px-3 py-1 rounded-full transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results */}
                {searchResults.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {searchResults.map((result, i) => (
                      <motion.div
                        key={result.place_name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-cyan-400/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-white font-bold text-lg">{result.place_name}</h3>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">
                                {result.region}
                              </span>
                              <span className="text-xs bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded-full">
                                {result.category}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-cyan-400">
                              {result.similarity_pct.toFixed(0)}%
                            </div>
                            <div className="text-white/30 text-xs">match</div>
                          </div>
                        </div>

                        {/* Similarity bar */}
                        <div className="h-1.5 bg-white/10 rounded-full mb-4 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(result.similarity_pct * 2, 100)}%` }}
                            transition={{ duration: 0.8, delay: i * 0.08 }}
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          />
                        </div>

                        <p className="text-white/60 text-sm mb-4 leading-relaxed">{result.description}</p>

                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="bg-white/5 rounded-xl p-2">
                            <p className="text-white font-semibold text-sm">₹{result.avg_cost}</p>
                            <p className="text-white/40 text-xs">Cost</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-2">
                            <p className="text-white font-semibold text-sm">{result.altitude_m}m</p>
                            <p className="text-white/40 text-xs">Altitude</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-2">
                            <p className="text-white font-semibold text-sm">{result.visit_duration_hours}h</p>
                            <p className="text-white/40 text-xs">Duration</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════════════════════════════════════ */}
            {/* TAB 2: CROWD-OPTIMAL DATE FINDER          */}
            {/* ══════════════════════════════════════════ */}
            {activeTab === "dates" && (
              <motion.div
                key="dates"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <Calendar size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold">Crowd-Optimal Date Finder</p>
                      <p className="text-white/40 text-xs">Random Forest runs 30-day predictions to find your quietest window</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/15 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-purple-400"
                    >
                      {DESTINATIONS.map((d) => (
                        <option key={d} className="bg-slate-900">{d}</option>
                      ))}
                    </select>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleDateSearch}
                      disabled={dateLoading}
                      className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold disabled:opacity-50 flex items-center gap-2"
                    >
                      {dateLoading ? (
                        <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}>
                          <Zap size={16} />
                        </motion.span>
                      ) : (
                        <Calendar size={16} />
                      )}
                      Analyse
                    </motion.button>
                  </div>
                </div>

                {dateResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* AI Recommendation banner */}
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-2xl p-5">
                      <p className="text-purple-300 text-sm font-semibold mb-1">🤖 ML Recommendation</p>
                      <p className="text-white font-semibold">{dateResult.recommendation}</p>
                    </div>

                    {/* Distribution */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                      <p className="text-white font-bold mb-4">30-Day Crowd Distribution</p>
                      <div className="space-y-3">
                        {Object.entries(dateResult.crowd_distribution).map(([level, count]: any) => {
                          const c = CROWD_COLORS[level as keyof typeof CROWD_COLORS];
                          const pct = Math.round((count / 30) * 100);
                          return (
                            <div key={level}>
                              <div className="flex justify-between text-sm mb-1.5">
                                <span className={`font-medium ${c.text}`}>{level} Crowd</span>
                                <span className="text-white/60">{count} days ({pct}%)</span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8 }}
                                  className={`h-full rounded-full ${c.dot}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Best dates */}
                    <div>
                      <p className="text-white font-bold mb-4">✅ Best 5 Days to Visit</p>
                      <div className="grid md:grid-cols-5 gap-3">
                        {dateResult.best_dates.map((d: DateRecommendation, i: number) => {
                          const c = CROWD_COLORS[d.crowd_level];
                          return (
                            <motion.div
                              key={d.date}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className={`${c.bg} border ${c.border} rounded-2xl p-4 text-center`}
                            >
                              <p className="text-white/50 text-xs mb-1">{d.day_of_week}</p>
                              <p className="text-white font-bold text-sm">{d.date}</p>
                              <p className={`text-xs font-bold mt-2 ${c.text}`}>{d.crowd_level}</p>
                              <p className="text-white/50 text-xs mt-1">{d.avg_temp_c}°C</p>
                              {d.is_holiday && <p className="text-yellow-400 text-xs mt-1">🎉 Holiday</p>}
                              {d.is_weekend && !d.is_holiday && <p className="text-white/30 text-xs mt-1">Weekend</p>}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Worst dates (for contrast) */}
                    <div>
                      <p className="text-white font-bold mb-4">⚠️ Avoid These 5 Days</p>
                      <div className="grid md:grid-cols-5 gap-3 opacity-60">
                        {dateResult.worst_dates.map((d: DateRecommendation, i: number) => {
                          const c = CROWD_COLORS[d.crowd_level];
                          return (
                            <div
                              key={d.date}
                              className={`${c.bg} border ${c.border} rounded-2xl p-4 text-center`}
                            >
                              <p className="text-white/50 text-xs mb-1">{d.day_of_week}</p>
                              <p className="text-white font-bold text-sm">{d.date}</p>
                              <p className={`text-xs font-bold mt-2 ${c.text}`}>{d.crowd_level}</p>
                              <p className="text-white/50 text-xs mt-1">{d.avg_temp_c}°C</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ══════════════════════════════════════════ */}
            {/* TAB 3: K-MEANS TRAVEL CIRCUITS            */}
            {/* ══════════════════════════════════════════ */}
            {activeTab === "circuits" && (
              <motion.div
                key="circuits"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <Map size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold">K-Means Travel Circuits (k=3)</p>
                      <p className="text-white/40 text-xs">Unsupervised clustering on altitude, popularity, cost and duration</p>
                    </div>
                  </div>
                </div>

                {circuitsLoading ? (
                  <div className="text-center py-20 text-white/40">Building clusters...</div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {Object.entries(circuits).map(([id, circuit]) => (
                      <motion.button
                        key={id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setActiveCircuit(id)}
                        className={`text-left p-6 rounded-2xl border transition-all duration-300 ${
                          activeCircuit === id
                            ? "bg-white/10 border-orange-400/40 shadow-xl"
                            : "bg-white/4 border-white/10 hover:bg-white/7"
                        }`}
                      >
                        <div className="text-4xl mb-3">{circuit.emoji}</div>
                        <h3 className="text-white font-bold mb-2">{circuit.name}</h3>
                        <p className="text-white/50 text-sm mb-4 leading-relaxed">{circuit.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white/5 rounded-lg p-2 text-center">
                            <p className="text-white font-bold">{circuit.place_count}</p>
                            <p className="text-white/40">Destinations</p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2 text-center">
                            <p className="text-white font-bold">{circuit.avg_altitude_m}m</p>
                            <p className="text-white/40">Avg Altitude</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Active circuit places */}
                {activeCircuit && circuits[activeCircuit] && (
                  <motion.div
                    key={activeCircuit}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl">{circuits[activeCircuit].emoji}</span>
                      <div>
                        <h3 className="text-white font-bold text-xl">{circuits[activeCircuit].name}</h3>
                        <p className="text-white/50 text-sm">{circuits[activeCircuit].place_count} destinations · Avg ₹{circuits[activeCircuit].avg_cost}/person · {circuits[activeCircuit].avg_duration_hours}h avg visit</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      {circuits[activeCircuit].place_details.map((place, i) => (
                        <motion.div
                          key={place.place_name}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/8 hover:border-orange-400/20 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/20 flex items-center justify-center text-orange-400 font-bold text-sm flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold truncate">{place.place_name}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs text-white/40">{place.region}</span>
                              <span className="text-xs text-orange-300/70">{place.category}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-white/70 text-sm font-medium">{place.altitude_m}m</p>
                            <p className="text-white/30 text-xs">altitude</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ML TECHNIQUES EXPLAINER FOOTER */}
          <div className="mt-16 mb-12 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "TF-IDF + Cosine Similarity",
                icon: "🔤",
                detail: "Converts attraction descriptions into TF-IDF vectors. User queries are vectorized identically and ranked by cosine angle.",
                color: "from-cyan-500/10 to-blue-500/10",
                border: "border-cyan-400/20",
              },
              {
                title: "Random Forest Classifier",
                icon: "🌲",
                detail: "Trained Random Forest predicts crowd levels (Low/Medium/High) for each destination across 30 days using month, weekday, holiday and temperature features.",
                color: "from-purple-500/10 to-pink-500/10",
                border: "border-purple-400/20",
              },
              {
                title: "K-Means Clustering (k=3)",
                icon: "🔵",
                detail: "Groups all 11 destinations into 3 clusters using altitude, popularity score, average cost and visit duration as feature dimensions.",
                color: "from-orange-500/10 to-red-500/10",
                border: "border-orange-400/20",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`bg-gradient-to-br ${item.color} border ${item.border} rounded-2xl p-6`}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="text-white font-bold mb-2">{item.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
