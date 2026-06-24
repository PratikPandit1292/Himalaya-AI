import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface LocationCardProps {
  stateId: string;
  locationId: string;
  name: string;
  tagline: string;
  image: string;
  index: number;
}

const LocationCard = ({ stateId, locationId, name, tagline, image, index }: LocationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/state/${stateId}/location/${locationId}`} className="group block">
        <div className="relative h-[350px] md:h-[400px] rounded-xl overflow-hidden card-hover">
          {/* Background Image */}
          <img
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <div className="flex items-center gap-2 text-accent mb-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Must Visit</span>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
              {name}
            </h3>
            <p className="text-primary-foreground/70 text-sm md:text-base line-clamp-2">
              {tagline}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default LocationCard;
