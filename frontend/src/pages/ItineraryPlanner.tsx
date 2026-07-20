import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import sikkimHero from "@/assets/sikkim/sikkim-hero.jpg";
import tsomgoLake from "@/assets/sikkim/tsomgo-lake.jpg";
import { itineraryAPI } from "@/services/itineraryAPI";
import { API_BASE_URL } from "@/services/api";
import { authAPI, getStoredToken, getStoredUser } from "@/services/authAPI";

const interestsList = [
  "Nature",
  "Photography",
  "Adventure",
  "Spiritual",
  "Culture",
  "Family",
];

export default function ItineraryPlanner() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, -250]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const plannerY = useTransform(scrollY, [250, 900], [250, 0]);
  const plannerOpacity = useTransform(scrollY, [250, 700], [0, 1]);
  const arrowOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [sourceCity, setSourceCity] = useState("");
  const [destination, setDestination] = useState("Gangtok");
  const [days, setDays] = useState(3);
  const [people, setPeople] = useState(2);
  const [startDate, setStartDate] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Nature", "Photography"]);
  const [tripResult, setTripResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentUser = getStoredUser();
  const token = getStoredToken();

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleGenerateTrip = async () => {
    try {
      setLoading(true);
      setTripResult(null);
      setSaveSuccess(false);

      const response = await itineraryAPI.generateSmartTrip({
        source_city: sourceCity,
        days,
        people,
        interests: selectedInterests,
        start_date: startDate || undefined,
      });

      setTripResult({
        ...response,
        days,
        people,
        interests: selectedInterests,
        start_date: startDate,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!tripResult) return;
    try {
      setPdfLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/itinerary/download-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripResult),
      });

      if (!response.ok) throw new Error("PDF generation failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "himalaya_itinerary.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF error:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (!token || !tripResult) return;
    try {
      setSaveLoading(true);
      await authAPI.saveItinerary(token, tripResult);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-slate-950">

      {/* Background */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `url(${tsomgoLake})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Aurora Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 left-10 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[180px]" />
        <div className="absolute top-[40%] right-0 w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[220px]" />
        <div className="absolute bottom-0 left-1/3 w-[450px] h-[450px] bg-pink-500/10 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* HERO */}
        <section className="relative h-screen overflow-hidden">
          <img src={sikkimHero} alt="Sikkim" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/65" />
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
          >
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-accent tracking-[0.35em] uppercase text-sm font-semibold">
              🧠 AI Powered Travel Planning
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white font-serif text-5xl md:text-7xl font-bold mt-6"
            >
              Plan Your Perfect
              <br />
              Himalayan Journey
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/80 text-lg md:text-xl mt-8 max-w-3xl"
            >
              Personalized itineraries crafted by AI, crowd-aware routes,
              hidden gems and smart travel recommendations across the Himalayas.
            </motion.p>

            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {["🤖 AI Planner", "📸 Hidden Gems", "👥 Crowd Aware", "🌤 Weather Smart", "📄 PDF Export"].map(
                (feature) => (
                  <div
                    key={feature}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 text-white px-5 py-2 rounded-full text-sm"
                  >
                    {feature}
                  </div>
                )
              )}
            </div>

            <motion.div
              style={{ opacity: arrowOpacity }}
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center"
            >
              <p className="text-white/70 text-sm tracking-wider uppercase">Scroll To Create Your Journey</p>
              <div className="text-white text-3xl mt-2">↓</div>
            </motion.div>
          </motion.div>
        </section>

        {/* DESIGN YOUR JOURNEY */}
        <section className="relative z-20 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-white text-4xl md:text-5xl font-bold">Design Your Journey</h2>
            <p className="text-center text-white/70 max-w-3xl mx-auto mt-4">
              Tell us your travel style and Gemini AI will craft a personalized Himalayan itinerary
              tailored to your interests, dates, and preferences.
            </p>
          </div>
        </section>

        {/* PLANNER CARD */}
        <motion.section style={{ y: plannerY, opacity: plannerOpacity }} className="relative py-24 z-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12">

              <h2 className="text-3xl font-bold text-white text-center mb-10">
                ✨ Create Your AI Travel Plan
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Source City</label>
                  <input
                    type="text"
                    value={sourceCity}
                    onChange={(e) => setSourceCity(e.target.value)}
                    placeholder="Mumbai, Delhi..."
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Number of Days</label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Number of People</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={people}
                    onChange={(e) => setPeople(Number(e.target.value))}
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white mb-2">Start Date <span className="text-white/40 text-sm">(optional — for AI-aware planning)</span></label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* INTERESTS */}
              <div className="mt-10">
                <h3 className="text-white font-semibold mb-4">Travel Interests</h3>
                <div className="flex flex-wrap gap-3">
                  {interestsList.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-5 py-2 rounded-full transition-all duration-300 ${
                        selectedInterests.includes(interest)
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                          : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* BUTTON */}
              <div className="mt-12 text-center">
                <button
                  onClick={handleGenerateTrip}
                  className="px-12 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-xl hover:scale-105 transition-all duration-300"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        ✨
                      </motion.span>
                      AI is crafting your journey...
                    </span>
                  ) : (
                    "✨ Generate AI Trip"
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* RESULTS */}
        {tripResult && (
          <section className="pb-24 px-4">
            <div className="max-w-6xl mx-auto">

              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-center text-white text-4xl font-bold mb-4"
              >
                
              </motion.h2>

              
              {tripResult.ai_narrative && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-10 rounded-3xl overflow-hidden bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-white/20 backdrop-blur-xl"
  >
    <div className="p-8 md:p-10">

      <p className="text-cyan-300 uppercase tracking-[0.3em] text-xs font-semibold mb-4">
        HIMALAYA AI TRAVEL PLAN
      </p>

      <h2 className="text-3xl md:text-4xl text-white font-bold mb-4">
        {tripResult.trip_title || "✨ Your AI-Crafted Himalayan Adventure"}
      </h2>

      <p className="text-white/80 text-lg leading-relaxed">
        {tripResult.trip_overview || tripResult.ai_narrative}
      </p>

    </div>
  </motion.div>
)}

{tripResult.travel_route && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-8 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-white/20 backdrop-blur-xl p-6"
  >
    <h3 className="text-2xl font-bold text-white mb-4">
      ✈ Travel Route
    </h3>
    <div className="flex flex-wrap gap-3 mb-5">

  <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
    <span className="text-cyan-300 font-medium">
      📍 Starting From: {sourceCity}
    </span>
  </div>

  <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-400/20">
    <span className="text-purple-300 font-medium">
      🏔 Destination: {destination}
    </span>
  </div>

</div>

    <div className="grid md:grid-cols-2 gap-4">

      <div>
        <p className="text-cyan-300 font-semibold">
          Recommended Mode
        </p>
        <p className="text-white">
          {tripResult.travel_route.recommended_mode}
        </p>
      </div>

      <div>
        <p className="text-cyan-300 font-semibold">
          Travel Time
        </p>
        <p className="text-white">
          {tripResult.travel_route.travel_time}
        </p>
      </div>

    </div>

    <div className="mt-4">
      <p className="text-cyan-300 font-semibold">
        Route
      </p>

      <p className="text-white text-lg">
        {tripResult.travel_route.route}
      </p>
    </div>

    <div className="mt-4 p-4 rounded-xl bg-white/5">
      <p className="text-yellow-300">
        💡 {tripResult.travel_route.travel_tip}
      </p>
    </div>
  </motion.div>
)}

              {/* TOP CARDS */}
              <div className="grid md:grid-cols-3 gap-6 mb-10">

                <motion.div whileHover={{ scale: 1.03 }} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                  <div className="text-4xl mb-4">👤</div>
                  <h3 className="text-white text-xl font-bold">Traveler Profile</h3>
                  <p className="text-cyan-300 mt-2 font-semibold">{tripResult?.traveler_profile || "Explorer"}</p>
                  <p className="text-white/70 mt-3">Personalized to your interests and travel style.</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="text-white text-xl font-bold">Estimated Cost</h3>
                  <p className="text-green-400 text-3xl font-bold mt-4">₹{(tripResult?.estimated_cost || 0).toLocaleString()}</p>
                  <p className="text-white/70 mt-3">Includes travel, accommodation and sightseeing.</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
  <div className="text-4xl mb-4">🌟</div>

  <h3 className="text-white text-xl font-bold">
    Hidden Gem
  </h3>

  <p className="text-yellow-300 font-semibold mt-2">
    {tripResult?.hidden_gem?.place_name || "No hidden gem found"}
  </p>

  {tripResult?.hidden_gem && (
    <>
      <p className="text-white/60 text-sm mt-1">
        📍 {tripResult.hidden_gem.district}
      </p>

      <p className="text-white/70 text-sm mt-3">
        {tripResult.hidden_gem.description}
      </p>

      <p className="text-cyan-300 text-sm mt-2">
        🌤 Best Time: {tripResult.hidden_gem.best_time}
      </p>
    </>
  )}
</motion.div>

              </div>

              {/* TIMELINE */}
              <div className="space-y-8">
                {Object.entries(tripResult.itinerary).map(([day, details]: any, dayIndex) => (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: dayIndex * 0.05 }}
                    whileHover={{ scale: 1.005 }}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8"
                  >
                    <div className="mb-5">

  <h3 className="text-white text-3xl font-bold mb-4">
    📅 {day}
  </h3>

  <div className="flex flex-wrap gap-3">

    <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
      <span className="text-cyan-300 text-sm font-medium">
        🏔 Region: {details.region}
      </span>
    </div>

    {details.theme && (
      <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-400/20">
        <span className="text-purple-300 text-sm font-medium">
          🎯 {details.theme}
        </span>
      </div>
    )}

    {details.predicted_crowd_level && (
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
          details.predicted_crowd_level === "High"
            ? "bg-red-500/10 border-red-400/20"
            : details.predicted_crowd_level === "Medium"
            ? "bg-yellow-500/10 border-yellow-400/20"
            : "bg-green-500/10 border-green-400/20"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            details.predicted_crowd_level === "High"
              ? "bg-red-400 animate-pulse"
              : details.predicted_crowd_level === "Medium"
              ? "bg-yellow-400"
              : "bg-green-400"
          }`}
        />
        <span
          className={`text-sm font-medium ${
            details.predicted_crowd_level === "High"
              ? "text-red-300"
              : details.predicted_crowd_level === "Medium"
              ? "text-yellow-300"
              : "text-green-300"
          }`}
        >
          {details.predicted_crowd_level} Crowd
        </span>
      </div>
    )}

  </div>

</div>

                    {details.day_summary && (
                      <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
  <p className="text-white/80 leading-relaxed">
                        {details.day_summary}
                      </p>
                      </div>
                    )}

                    {details.crowd_advisory && (
                      <div className="mb-6 rounded-2xl overflow-hidden bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 border border-orange-400/20">
                        <div className="p-5 flex gap-4 items-start">
                          <div className="shrink-0 w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-400/30 flex items-center justify-center text-lg">
                            🔮
                          </div>
                          <div className="flex-1">
                            <p className="text-orange-300 uppercase tracking-[0.2em] text-[10px] font-semibold mb-1.5">
                              AI Crowd Insight
                            </p>
                            <p className="text-white/90 text-sm leading-relaxed">
                              {details.crowd_advisory}
                            </p>
                            {details.better_date_suggestion && (
                              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20">
                                <span className="text-white/50 text-xs">Better date</span>
                                <span className="text-orange-300 text-xs font-semibold">
                                  {details.better_date_suggestion}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {details.schedule_narrative ? (
                      <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-white/85 leading-relaxed text-[15px]">
                          {details.schedule_narrative}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {details.places.map((place: any, index: number) => (
                          <div
                            key={index}
                            className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-cyan-400/30 transition-colors"
                          >
                            <h4 className="text-white font-semibold text-lg">📍 {place.place_name}</h4>
                            <p className="text-green-300 text-sm mt-1">💰 ₹{place.avg_cost}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* TRAVEL TIP */}
              {tripResult.travel_tip && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-400/20 rounded-2xl p-6"
                >
                  <p className="text-green-300 text-sm font-semibold uppercase tracking-wider mb-2">💡 Travel Tip</p>
                  <p className="text-white/80">{tripResult.travel_tip}</p>
                </motion.div>
              )}

              {/* ACTION BUTTONS */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="mt-10 flex flex-wrap gap-4 justify-center"
              >
                {/* PDF Download */}
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-60"
                >
                  {pdfLoading ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>⏳</motion.span>
                  ) : (
                    "📄"
                  )}
                  {pdfLoading ? "Generating PDF..." : "Download PDF Itinerary"}
                </button>

                {/* Save (requires login) */}
                {currentUser ? (
                  <button
                    onClick={handleSaveItinerary}
                    disabled={saveLoading || saveSuccess}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-60 ${
                      saveSuccess
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                        : "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                    }`}
                  >
                    {saveSuccess ? "✅ Saved!" : saveLoading ? "Saving..." : "💾 Save Itinerary"}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 border border-white/20 text-white/60 text-sm">
                    🔒 Sign in to save your itinerary
                  </div>
                )}
              </motion.div>

            </div>
          </section>
        )}

        <Footer />
      </div>
    </div>
  );
}