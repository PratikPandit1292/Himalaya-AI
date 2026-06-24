import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Star,
  MapPin,
  Camera,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { getStateById, getLocationById } from "@/data/destinations";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

// Import images
import gangtok from "@/assets/sikkim/gangtok.jpg";
import tsomgoLake from "@/assets/sikkim/tsomgo-lake.jpg";
import yumthangValley from "@/assets/sikkim/yumthang-valley.jpg";
import manali from "@/assets/images/manali.jpg";
import spitiValley from "@/assets/images/spiti-valley.jpg";
import dharamshala from "@/assets/images/dharamshala.jpg";

const locationImages: Record<string, string> = {
  gangtok,
  "tsomgo-lake": tsomgoLake,
  "yumthang-valley": yumthangValley,
  manali,
  "spiti-valley": spitiValley,
  dharamshala,
};

const LocationPage = () => {
  const params = useParams();

  const rawStateId = (params.stateId || params.stateName || "").trim();
  const rawLocationId = (params.locationId || params.locationName || "").trim();

  const stateId = rawStateId.toLowerCase();
  const locationId = rawLocationId.toLowerCase();

  const state = stateId ? getStateById(stateId) : undefined;
  const location =
    stateId && locationId ? getLocationById(stateId, locationId) : undefined;

  if (!state || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
            Location Not Found
          </h1>
          <Link to="/" className="text-primary hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative h-[75vh] min-h-[550px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={locationImages[location.id]}
            alt={location.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white mb-6"
          >
            <MapPin className="w-4 h-4 text-accent" />
            <span className="text-sm tracking-wider uppercase">
              {state.name}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg"
          >
            {location.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="font-serif text-xl md:text-2xl text-white/90 italic max-w-2xl"
          >
            {location.tagline}
          </motion.p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="section-padding bg-gradient-to-b from-background to-muted/40">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">

            {/* QUICK FACTS */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-4 gap-4 mb-16"
            >
              <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Best Time</h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {location.bestTime}
                </p>
              </div>

              <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Highlights</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {location.topAttractions.length} Attractions
                </p>
              </div>

              <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Activities</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {location.thingsToDo.length} Things to do
                </p>
              </div>

              <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Region</h3>
                </div>
                <p className="text-sm text-muted-foreground">{state.name}</p>
              </div>
            </motion.div>

            {/* DESCRIPTION */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 bg-card border border-border rounded-3xl p-10 shadow-sm"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                About {location.name}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light">
                {location.description}
              </p>
            </motion.div>

            {/* WHY VISIT */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 bg-card border border-border rounded-3xl p-10 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-7 h-7 text-accent" />
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                  Why Visit {location.name}?
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {location.whyVisit.map((reason, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="rounded-2xl bg-muted/50 p-5 border border-border"
                  >
                    <p className="text-muted-foreground">{reason}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* TOP ATTRACTIONS */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 bg-card border border-border rounded-3xl p-10 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-7 h-7 text-accent" />
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                  Top Attractions
                </h2>
              </div>

              <div className="grid gap-4">
                {location.topAttractions.map((attraction, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="rounded-2xl bg-muted/40 border border-border px-6 py-5 hover:bg-muted/70 transition-colors duration-300"
                  >
                    <span className="text-foreground font-medium">
                      {attraction}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* THINGS TO DO */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 bg-card border border-border rounded-3xl p-10 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <Camera className="w-7 h-7 text-accent" />
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                  Things To Do
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {location.thingsToDo.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="rounded-2xl bg-primary/5 border border-primary/10 px-6 py-5 hover:bg-primary/10 transition-colors duration-300"
                  >
                    <span className="text-foreground">{activity}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA SECTION */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl p-10 bg-gradient-to-r from-[#0B3D2E] to-[#145A45] text-white shadow-lg"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">
                Ready to Explore {location.name}?
              </h2>
              <p className="text-white/80 max-w-2xl mb-6">
                Discover breathtaking landscapes, unique culture, and unforgettable
                adventures. Plan your journey and make memories that last forever.
              </p>

              <Link
                to={`/state/${state.id}`}
                className="inline-flex items-center gap-2 bg-white text-[#0B3D2E] font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Explore more of {state.name}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LocationPage;


