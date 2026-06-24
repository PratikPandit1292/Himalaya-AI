import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Star } from "lucide-react";
import { predictionAPI } from "@/services/predictionAPI";
import { weatherAPI, type WeatherData } from "@/services/weatherAPI";
import { feedbackAPI } from "@/services/feedbackAPI";

import gangtok from "@/assets/sikkim/gangtok.jpg";
import tsomgoLake from "@/assets/sikkim/tsomgo-lake.jpg";
import yumthangValley from "@/assets/sikkim/yumthang-valley.jpg";
import manali from "@/assets/images/manali.jpg";
import spitiValley from "@/assets/images/spiti-valley.jpg";
import dharamshala from "@/assets/images/dharamshala.jpg";

import gangtokCrowd from "@/assets/sikkim/sikkim_crowd_pic/gangtok.jpg";
import namchiCrowd from "@/assets/sikkim/sikkim_crowd_pic/Namchi.png";
import nathulaCrowd from "@/assets/sikkim/sikkim_crowd_pic/nathula_pass.jpg";
import pellingCrowd from "@/assets/sikkim/sikkim_crowd_pic/pelling.png";
import ravanglaCrowd from "@/assets/sikkim/sikkim_crowd_pic/Ravangla.png";
import tsomgoCrowd from "@/assets/sikkim/sikkim_crowd_pic/tsomgo-lake.jpg";
import yuksomCrowd from "@/assets/sikkim/sikkim_crowd_pic/yuksom.png";
import lachenCrowd from "@/assets/sikkim/sikkim_crowd_pic/Lachen.png";
import lachungCrowd from "@/assets/sikkim/sikkim_crowd_pic/Lachung.png";
import rumtekCrowd from "@/assets/sikkim/sikkim_crowd_pic/rumtek.png";
import zulukCrowd from "@/assets/sikkim/sikkim_crowd_pic/Zuluk.png";

type Props = {
  stateName: string;
  locations: { id: string; name: string }[];
};

interface PredictionData {
  destination: string;
  date: string;
  crowd_level: string;
  crowd_emoji: string;
  weather: string;
  avg_temp: number;
  recommendation: string;
  travel_tips: string;
  shap_factors: { factor: string; contribution: number }[];
}

const locationBg: Record<string, string> = {
  Gangtok: gangtokCrowd,
  "Tsomgo Lake": tsomgoCrowd,
  "Nathula Pass": nathulaCrowd,
  Pelling: pellingCrowd,
  Yuksom: yuksomCrowd,
  Ravangla: ravanglaCrowd,
  Namchi: namchiCrowd,
  Lachung: lachungCrowd,
  Lachen: lachenCrowd,
  "Rumtek Monastery": rumtekCrowd,
  Zuluk: zulukCrowd,
  Manali: manali,
  "Spiti Valley": spitiValley,
  Dharamshala: dharamshala,
};

const sikkimAllSpots = [
  { id: "gangtok", name: "Gangtok" },
  { id: "tsomgo-lake", name: "Tsomgo Lake" },
  { id: "nathula-pass", name: "Nathula Pass" },
  { id: "pelling", name: "Pelling" },
  { id: "yuksom", name: "Yuksom" },
  { id: "ravangla", name: "Ravangla" },
  { id: "namchi", name: "Namchi" },
  { id: "lachung", name: "Lachung" },
  { id: "lachen", name: "Lachen" },
  { id: "rumtek-monastery", name: "Rumtek Monastery" },
  { id: "zuluk", name: "Zuluk" },
];

const SHAP_COLORS = ["#22d3ee", "#a78bfa", "#fb923c"];

const FluxPrediction = ({ stateName, locations }: Props) => {
  const predictionSpots = stateName === "Sikkim" ? sikkimAllSpots : locations;

  const [spot, setSpot] = useState(predictionSpots[0]?.name || "");
  const [travelDate, setTravelDate] = useState("");
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Live weather state
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [actualCrowd, setActualCrowd] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Fetch live weather whenever spot changes
  useEffect(() => {
    setWeather(null);
    setWeatherLoading(true);
    weatherAPI
      .getCurrentWeather(spot)
      .then((data) => setWeather(data))
      .catch(() => setWeather(null))
      .finally(() => setWeatherLoading(false));
  }, [spot]);

  const generatePrediction = async () => {
    if (!spot || !travelDate) {
      setError("Please select both destination and date");
      return;
    }
    setLoading(true);
    setError("");
    setPrediction(null);
    setFeedbackRating(0);
    setFeedbackSubmitted(false);
    setActualCrowd("");

    try {
      const data = await predictionAPI.getPrediction(spot, travelDate);
      setPrediction(data);
    } catch (error) {
      setError("Unable to generate prediction. Please try again.");
    }
    setLoading(false);
  };

  const handleFeedbackSubmit = async () => {
    if (!prediction || feedbackRating === 0) return;
    setFeedbackLoading(true);
    try {
      await feedbackAPI.submit({
        destination: prediction.destination,
        travel_date: prediction.date,
        predicted_crowd: prediction.crowd_level,
        actual_crowd: actualCrowd || undefined,
        accuracy_rating: feedbackRating,
      });
      setFeedbackSubmitted(true);
    } catch {
      // silently fail
    } finally {
      setFeedbackLoading(false);
    }
  };

  const getCrowdColor = () => {
    if (!prediction) return "#ffffff";
    switch (prediction.crowd_level) {
      case "Low": return "#60A5FA";
      case "Medium": return "#FBBF24";
      case "High": return "#F87171";
      default: return "#ffffff";
    }
  };

  const crowdColor = getCrowdColor();

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("rain") || c.includes("drizzle")) return "🌧";
    if (c.includes("snow") || c.includes("freez")) return "❄️";
    if (c.includes("cloud") || c.includes("overcast")) return "☁️";
    if (c.includes("mist") || c.includes("fog") || c.includes("haze")) return "🌫";
    return "☀️";
  };

  return (
    <section className="relative min-h-[900px] py-20 overflow-hidden">

      {/* Background */}
      <motion.div
        key={spot}
        initial={{ scale: 1.12, opacity: 0 }}
        animate={{ scale: 1.05, opacity: 0.8 }}
        transition={{ duration: 1.4 }}
        className="absolute inset-0"
      >
        <img
          src={locationBg[spot] || gangtok}
          className="w-full h-full object-cover brightness-110 contrast-110"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Title */}
        <div className="text-center mb-24">
          <span className="text-accent tracking-[0.4em] uppercase text-xs font-semibold">
            Smart Tourism Intelligence
          </span>
          <h2 className="font-serif text-5xl md:text-6xl font-bold mt-4 text-white">
            AI Crowd Forecast
          </h2>
          <p className="text-white/80 mt-5 max-w-2xl mx-auto text-lg">
            Predict travel density, weather, and get AI-powered recommendations across {stateName}.
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center gap-3 p-4 rounded-2xl bg-red-500/20 border border-red-400/40 text-red-200"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Main Card */}
        <div className="backdrop-blur-3xl bg-white/8 border border-white/15 rounded-3xl p-8 md:p-12 shadow-[0_25px_150px_rgba(0,0,0,0.5)]">

          <div className="grid md:grid-cols-2 gap-12">

            {/* LEFT — INPUTS + LIVE WEATHER */}
            <div className="space-y-6 text-white">

              {/* Destination select */}
              <div>
                <label className="text-xs tracking-[0.35em] text-accent uppercase font-semibold block mb-4">
                  📍 Destination
                </label>
                <select
                  value={spot}
                  onChange={(e) => setSpot(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-lg outline-none focus:border-accent focus:bg-white/10 transition-all"
                >
                  {predictionSpots.map((loc) => (
                    <option key={loc.id} className="bg-neutral-900 text-white">
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location image */}
              <div className="overflow-hidden rounded-2xl border border-white/10 shadow-xl">
                <img
                  src={locationBg[spot] || gangtokCrowd}
                  alt={spot}
                  className="w-full h-44 object-cover"
                />
              </div>

              {/* LIVE WEATHER CARD */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-xs text-accent uppercase tracking-widest font-semibold mb-3">
                  🌍 Live Conditions — {spot}
                </p>
                {weatherLoading ? (
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>⚡</motion.span>
                    Fetching live data...
                  </div>
                ) : weather ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {getWeatherIcon(weather.condition)} {weather.temp_c}°C
                      </p>
                      <p className="text-white/60 text-sm mt-1">{weather.condition}</p>
                      <p className="text-white/40 text-xs">Feels like {weather.feels_like}°C</p>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <p className="text-white/70">💧 Humidity: <span className="text-white font-medium">{weather.humidity}%</span></p>
                      <p className="text-white/70">💨 Wind: <span className="text-white font-medium">{weather.wind_kmh} km/h</span></p>
                      <p className={`text-xs mt-2 ${weather.source === "live" ? "text-green-400" : "text-yellow-400/70"}`}>
                        {weather.source === "live" ? "● Live" : weather.source === "cache" ? "● Cached" : "● Estimated"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/40 text-sm">Weather data unavailable</p>
                )}
              </div>

              {/* Date picker */}
              <div>
                <label className="text-xs tracking-[0.35em] text-accent uppercase font-semibold block mb-4">
                  📅 Travel Date
                </label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-lg outline-none focus:border-accent focus:bg-white/10 transition-all"
                />
              </div>

              {/* Generate button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={!spot || !travelDate || loading}
                onClick={generatePrediction}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-accent to-orange-400 text-white font-bold tracking-wide shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>⚡</motion.span>
                    Analyzing with AI...
                  </span>
                ) : (
                  "Generate Prediction"
                )}
              </motion.button>
            </div>

            {/* RIGHT — RESULTS */}
            <div className="flex flex-col justify-center">
              {!prediction && !loading && (
                <div className="text-center text-white/60">
                  <p className="text-lg">Select destination and date to begin</p>
                </div>
              )}

              {loading && (
                <div className="text-center text-white">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-6xl mb-4">
                    🔮
                  </motion.div>
                  <p className="text-lg font-semibold">Running AI analysis...</p>
                </div>
              )}

              {prediction && !loading && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Destination */}
                  <div className="text-center">
                    <p className="text-accent uppercase tracking-[0.3em] text-xs">Destination</p>
                    <h3 className="text-white text-3xl font-bold mt-2">📍 {prediction.destination}</h3>
                  </div>

                  {/* Crowd Circle */}
                  <div className="flex flex-col items-center">
                    <p className="tracking-[0.3em] text-xs uppercase text-accent mb-6 font-semibold">Crowd Prediction</p>
                    <motion.div
                      animate={{ boxShadow: `0 0 80px ${crowdColor}44` }}
                      className="relative w-56 h-56 rounded-full border-2 flex flex-col items-center justify-center text-center p-6"
                      style={{ borderColor: crowdColor }}
                    >
                      <span className="text-4xl mb-2">{prediction.crowd_emoji}</span>
                      <motion.span
                        key={prediction.crowd_level}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-bold"
                        style={{ color: crowdColor }}
                      >
                        {prediction.crowd_level}
                      </motion.span>
                    </motion.div>
                  </div>

                  {/* ML vs Live Weather Comparison */}
                  <div className="grid grid-cols-2 gap-3 text-white">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                      <p className="text-xs text-accent font-semibold mb-1">🤖 ML Predicted</p>
                      <p className="text-2xl font-bold">{prediction.avg_temp}°C</p>
                      <p className="text-white/50 text-xs mt-1">Random Forest</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                      <p className="text-xs text-green-400 font-semibold mb-1">🌍 Live Now</p>
                      <p className="text-2xl font-bold">
                        {weather ? `${weather.temp_c}°C` : "—"}
                      </p>
                      <p className="text-white/50 text-xs mt-1">{weather?.condition || "N/A"}</p>
                    </div>
                  </div>

                  {/* Weather label */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <p className="text-xs text-accent font-semibold mb-1">🌤 ML Weather Forecast</p>
                    <p className="text-lg font-semibold text-white">{prediction.weather}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* BELOW — Recommendation + SHAP + Feedback */}
          {prediction && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 pt-8 border-t border-white/10 space-y-8"
            >

              {/* Recommendation + Tips */}
              <div className="grid md:grid-cols-2 gap-8 text-white">
                <div className="bg-gradient-to-br from-accent/10 to-orange-400/10 border border-accent/20 rounded-2xl p-6">
                  <p className="tracking-[0.3em] text-xs uppercase text-accent font-semibold mb-4">💡 AI Recommendation</p>
                  <p className="text-base leading-relaxed text-white/90">{prediction.recommendation}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-400/10 to-purple-400/10 border border-blue-400/20 rounded-2xl p-6">
                  <p className="tracking-[0.3em] text-xs uppercase text-blue-300 font-semibold mb-4">✈️ Travel Tips</p>
                  <p className="text-base leading-relaxed text-white/90">{prediction.travel_tips}</p>
                </div>
              </div>

              {/* SHAP EXPLAINABILITY */}
              {prediction.shap_factors && prediction.shap_factors.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                      XAI
                    </div>
                    <div>
                      <p className="text-white font-bold">Why This Prediction?</p>
                      <p className="text-white/50 text-xs">SHAP feature importance — top 3 factors driving this crowd forecast</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {prediction.shap_factors.map((factor, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-white/80 font-medium">{factor.factor}</span>
                          <span className="font-bold" style={{ color: SHAP_COLORS[i] }}>
                            {factor.contribution}%
                          </span>
                        </div>
                        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${factor.contribution}%` }}
                            transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: SHAP_COLORS[i] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-white/30 text-xs mt-5">
                    Powered by SHAP (SHapley Additive exPlanations) — model-level explainability for the Random Forest classifier
                  </p>
                </div>
              )}

              {/* FEEDBACK SECTION */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">🗓</span>
                  <div>
                    <p className="text-white font-bold">Were You There? Rate This Prediction</p>
                    <p className="text-white/50 text-sm">Your feedback trains better future predictions</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {feedbackSubmitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-6"
                    >
                      <div className="text-5xl mb-3">🙏</div>
                      <p className="text-green-400 font-bold text-lg">Thank you for your feedback!</p>
                      <p className="text-white/50 text-sm mt-1">Your data helps improve crowd prediction accuracy.</p>
                    </motion.div>
                  ) : (
                    <motion.div key="form" className="space-y-5">
                      {/* Star Rating */}
                      <div>
                        <p className="text-white/70 text-sm mb-3">How accurate was the crowd prediction?</p>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                              key={star}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setFeedbackRating(star)}
                              onMouseEnter={() => setFeedbackHover(star)}
                              onMouseLeave={() => setFeedbackHover(0)}
                            >
                              <Star
                                size={32}
                                className={`transition-colors ${
                                  star <= (feedbackHover || feedbackRating)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-white/20"
                                }`}
                              />
                            </motion.button>
                          ))}
                          {feedbackRating > 0 && (
                            <span className="text-white/60 text-sm self-center ml-2">
                              {["", "Poor", "Fair", "Good", "Great", "Excellent!"][feedbackRating]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actual crowd */}
                      <div>
                        <p className="text-white/70 text-sm mb-2">Actual crowd level you experienced:</p>
                        <div className="flex gap-3">
                          {["Low", "Medium", "High"].map((level) => (
                            <button
                              key={level}
                              onClick={() => setActualCrowd(level)}
                              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                                actualCrowd === level
                                  ? "bg-white text-black"
                                  : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={feedbackRating === 0 || feedbackLoading}
                        onClick={handleFeedbackSubmit}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        {feedbackLoading ? "Submitting..." : "Submit Feedback"}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FluxPrediction;
