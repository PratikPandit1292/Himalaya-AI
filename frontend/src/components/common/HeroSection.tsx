import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import heroImage from "@/assets/images/hero-main.jpg";

const HeroSection = () => {
  const scrollToContent = () => {
    const element = document.getElementById("featured-states");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Majestic Himalayan Mountains"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="mb-4 text-xl md:text-3xl font-semibold tracking-[0.35em] text-white/90 uppercase drop-shadow-lg">
            DISCOVER HIDDEN INDIA
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hero-title text-primary-foreground mb-6"
        >
          Explore the Unexplored
          <br />
          <span className="text-accent">Like Never Before</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="hero-subtitle text-primary-foreground/80 max-w-2xl mx-auto mb-0"
        >
          Journey beyond the ordinary. Discover India's raw beauty, hidden gems,
          and ancient cultures that few travelers ever witness.
        </motion.p>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <button
          onClick={scrollToContent}
          className="flex flex-col items-center text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-300"
          aria-label="Scroll to content"
        >
          <span className="text-sm mb-2 tracking-wide">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowDown className="w-5 h-5" />
          </motion.div>
        </button>
      </motion.div>
    </section>
  );
};

export default HeroSection;

