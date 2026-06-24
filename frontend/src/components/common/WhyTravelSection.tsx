import { motion } from "framer-motion";
import { MapPin, Heart, Compass, Mountain } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Hidden Gems",
    description: "Discover secret spots that most travelers never find",
  },
  {
    icon: Heart,
    title: "Authentic Culture",
    description: "Experience traditions passed down through generations",
  },
  {
    icon: Compass,
    title: "Real Adventures",
    description: "From treks to spiritual journeys, find your path",
  },
  {
    icon: Mountain,
    title: "Untouched Peace",
    description: "Escape the crowds and find your inner calm",
  },
];

const WhyTravelSection = () => {
  return (
    <section
      className="section-padding"
      style={{ backgroundColor: "#1B5E4B" }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Why Travel With Us
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            We don't just show you places. We help you feel them.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                <feature.icon className="w-10 h-10 text-white" />
              </div>

              <h3 className="font-serif text-2xl font-semibold text-white mb-3">
                {feature.title}
              </h3>

              <p className="text-white/75">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyTravelSection;

