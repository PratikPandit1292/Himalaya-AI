import { motion } from "framer-motion";
import StateCard from "./StateCard";
import { states } from "@/data/destinations";

import sikkimHero from "@/assets/sikkim/sikkim-hero.jpg";
import himachalHero from "@/assets/images/himachal-hero.jpg";

const stateImages: Record<string, string> = {
  sikkim: sikkimHero,
  "himachal-pradesh": himachalHero,
};

const FeaturedStates = () => {
  return (
    <section id="featured-states" className="section-padding bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-medium text-sm tracking-[0.2em] uppercase mb-4 block">
            Begin Your Journey
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Choose Your Destination
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Each state holds secrets waiting to be discovered. Where will your adventure begin?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {states.map((state, index) => (
            <StateCard
              key={state.id}
              id={state.id}
              name={state.name}
              tagline={state.tagline}
              image={stateImages[state.id]}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedStates;
