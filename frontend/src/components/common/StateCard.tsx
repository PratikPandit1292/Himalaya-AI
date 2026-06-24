import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface StateCardProps {
  id: string;
  name: string;
  tagline: string;
  image: string;
  index: number;
}

const StateCard = ({ id, name, tagline, image, index }: StateCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
    >
      <Link to={`/state/${id}`} className="group block">
        <div className="relative h-[380px] md:h-[420px] lg:h-[480px] rounded-2xl overflow-hidden card-hover">
          {/* Background Image */}
          <img
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 image-overlay" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:p-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
            >
              <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-3">
                {name}
              </h3>

              <p className="text-primary-foreground/80 text-base md:text-lg lg:text-xl mb-5 max-w-sm">
                {tagline}
              </p>

              <div className="flex items-center gap-2 text-accent font-semibold group-hover:gap-4 transition-all duration-300">
                <span>Explore {name}</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default StateCard;

