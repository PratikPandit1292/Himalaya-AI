import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import LocationCard from "@/components/common/LocationCard";

import { getStateById } from "@/data/destinations";

// Images
import sikkimHero from "@/assets/sikkim/sikkim-hero.jpg";
import himachalHero from "@/assets/images/himachal-hero.jpg";
import gangtok from "@/assets/sikkim/gangtok.jpg";
import tsomgoLake from "@/assets/sikkim/tsomgo-lake.jpg";
import yumthangValley from "@/assets/sikkim/yumthang-valley.jpg";
import manali from "@/assets/images/manali.jpg";
import spitiValley from "@/assets/images/spiti-valley.jpg";
import dharamshala from "@/assets/images/dharamshala.jpg";

const stateImages: Record<string, string> = {
  sikkim: sikkimHero,
  "himachal-pradesh": himachalHero,
};

const locationImages: Record<string, string> = {
  gangtok,
  "tsomgo-lake": tsomgoLake,
  "yumthang-valley": yumthangValley,
  manali,
  "spiti-valley": spitiValley,
  dharamshala,
};

const StatePage = () => {
  const params = useParams();
  const rawStateId = (params.stateId || params.stateName || "").toLowerCase();
  const state = getStateById(rawStateId);

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>State not found</p>
      </div>
    );
  }

  const scrollToLocations = () => {
    document.getElementById("locations")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative h-[80vh] flex items-center justify-center">
        <img
          src={stateImages[state.id]}
          alt={state.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative z-10 text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-title text-primary-foreground"
          >
            {state.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary-foreground/80 text-xl italic mt-4"
          >
            {state.tagline}
          </motion.p>
        </div>

        <button
          onClick={scrollToLocations}
          className="absolute bottom-10 text-primary-foreground"
        >
          <ArrowDown />
        </button>
      </section>

      {/* LOCATIONS */}
      <section id="locations" className="py-24">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {state.locations.map((loc, i) => (
            <LocationCard
              key={loc.id}
              stateId={state.id}
              locationId={loc.id}
              name={loc.name}
              tagline={loc.tagline}
              image={locationImages[loc.id]}
              index={i}
            />
          ))}
        </div>
      </section>

      
      <Footer />
    </div>
  );
};

export default StatePage;
