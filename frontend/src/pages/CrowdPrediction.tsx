import { useState } from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import PredictionSection from "@/components/prediction/PredictionSection";
import { states } from "@/data/destinations";
import { motion } from "framer-motion";
import sikkimHero from "@/assets/sikkim/sikkim-hero.jpg";

const CrowdPrediction = () => {
  const [selectedState, setSelectedState] = useState(states[0]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Header */}
      {/* Luxury Hero */}
<section className="relative h-[90vh] overflow-hidden">

  <img
    src={sikkimHero}
    alt="Sikkim"
    className="absolute inset-0 w-full h-full object-cover"
  />

  <div className="absolute inset-0 bg-black/60" />

  <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">

    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-accent tracking-[0.4em] uppercase text-sm font-semibold"
    >
      🔮 AI Powered Forecasting
    </motion.span>

    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-white font-serif text-5xl md:text-7xl font-bold mt-6"
    >
      Predict Before
      <br />
      You Travel
    </motion.h1>

    <motion.p
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-white/80 text-lg md:text-xl mt-8 max-w-3xl"
    >
      Forecast tourist crowds, weather conditions,
      temperature and travel insights before planning
      your Himalayan journey.
    </motion.p>

  </div>
</section>

      {/* State Switcher */}
      <section className="relative -mt-16 z-20">
        <div className="container mx-auto px-4 flex justify-center">

  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-full p-2 flex gap-3 shadow-2xl">

    {states.map((st) => (
      <button
        key={st.id}
        onClick={() => setSelectedState(st)}
        className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
          selectedState.id === st.id
            ? "bg-white text-black"
            : "text-white hover:bg-white/10"
        }`}
      >
        {st.name}
      </button>
    ))}

  </div>

</div>
      </section>

      {/* Prediction Section */}
      <div className="bg-slate-900">
        <PredictionSection
          key={selectedState.id}
          stateName={selectedState.name}
          locations={selectedState.locations}
        />
      </div>

      <Footer />
    </div>
  );
};

export default CrowdPrediction;
