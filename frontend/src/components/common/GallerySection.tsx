  // import { motion } from "framer-motion";

  // // Gallery images will use the existing location images
  // const galleryImages = [
  //   { src: "/src/assets/gangtok.jpg", alt: "Gangtok City", span: "col-span-1 row-span-1" },
  //   { src: "/src/assets/tsomgo-lake.jpg", alt: "Tsomgo Lake", span: "col-span-1 md:col-span-2 row-span-1 md:row-span-2" },
  //   { src: "/src/assets/yumthang-valley.jpg", alt: "Yumthang Valley", span: "col-span-1 row-span-1" },
  //   { src: "/src/assets/manali.jpg", alt: "Manali", span: "col-span-1 row-span-1" },
  //   { src: "/src/assets/spiti-valley.jpg", alt: "Spiti Valley", span: "col-span-1 md:col-span-2 row-span-1" },
  //   { src: "/src/assets/dharamshala.jpg", alt: "Dharamshala", span: "col-span-1 row-span-1" },
  // ];

  // const GallerySection = () => {
  //   return (
  //     <section id="gallery" className="section-padding">
  //       <div className="container mx-auto px-4">
  //         <motion.div
  //           initial={{ opacity: 0, y: 30 }}
  //           whileInView={{ opacity: 1, y: 0 }}
  //           viewport={{ once: true }}
  //           transition={{ duration: 0.6 }}
  //           className="text-center mb-16"
  //         >
  //           <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
  //             Get Inspired
  //           </h2>
  //           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
  //             A glimpse into the wonders that await you
  //           </p>
  //         </motion.div>

  //         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[250px]">
  //           {galleryImages.map((image, index) => (
  //             <motion.div
  //               key={image.alt}
  //               initial={{ opacity: 0, scale: 0.9 }}
  //               whileInView={{ opacity: 1, scale: 1 }}
  //               viewport={{ once: true }}
  //               transition={{ duration: 0.5, delay: index * 0.1 }}
  //               className={`${image.span} relative overflow-hidden rounded-xl group cursor-pointer`}
  //             >
  //               <img
  //                 src={image.src}
  //                 alt={image.alt}
  //                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
  //               />
  //               <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300" />
  //               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
  //                 <span className="text-primary-foreground font-serif text-xl font-semibold">
  //                   {image.alt}
  //                 </span>
  //               </div>
  //             </motion.div>
  //           ))}
  //         </div>
  //       </div>
  //     </section>
  //   );
  // };

  // export default GallerySection;

 import { motion } from "framer-motion";

import gangtok from "../../assets/sikkim/gangtok.jpg";
import tsomgo from "../../assets/sikkim/tsomgo-lake.jpg";
import yumthang from "../../assets/sikkim/yumthang-valley.jpg";
import manali from "../../assets/images/manali.jpg";
import spiti from "../../assets/images/spiti-valley.jpg";
import dharamshala from "../../assets/images/dharamshala.jpg";

import pelling from "../../assets/sikkim/pelling.png";
import kasol from "../../assets/images/kasol.png";

const GallerySection = () => {
  return (
    <section id="gallery" className="section-padding">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Get Inspired
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A glimpse into the wonders that await you
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[250px]">
          
          {/* Gangtok */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="col-span-1 row-span-1 relative overflow-hidden rounded-xl group cursor-pointer"
          >
            <img
              src={gangtok}
              alt="Gangtok City"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-primary-foreground font-serif text-xl font-semibold">
                Gangtok City
              </span>
            </div>
          </motion.div>

          {/* Tsomgo Lake (Big Center Image) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-1 md:col-span-2 row-span-1 md:row-span-2 relative overflow-hidden rounded-xl group cursor-pointer"
          >
            <img
              src={tsomgo}
              alt="Tsomgo Lake"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-primary-foreground font-serif text-xl font-semibold">
                Tsomgo Lake
              </span>
            </div>
          </motion.div>

          {/* Yumthang */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-1 row-span-1 relative overflow-hidden rounded-xl group cursor-pointer"
          >
            <img
              src={yumthang}
              alt="Yumthang Valley"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-primary-foreground font-serif text-xl font-semibold">
                Yumthang Valley
              </span>
            </div>
          </motion.div>

          {/* Manali */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-1 row-span-1 relative overflow-hidden rounded-xl group cursor-pointer"
          >
            <img
              src={manali}
              alt="Manali"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-primary-foreground font-serif text-xl font-semibold">
                Manali
              </span>
            </div>
          </motion.div>

          {/* Pelling + Kasol stacked block (FIXED POSITION) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="col-span-1 row-span-2 flex flex-col gap-4"
          >
            {/* Pelling */}
            <div className="relative overflow-hidden rounded-xl group cursor-pointer flex-1">
              <img
                src={pelling}
                alt="Pelling"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-primary-foreground font-serif text-xl font-semibold">
                  Pelling
                </span>
              </div>
            </div>

            {/* Kasol */}
            <div className="relative overflow-hidden rounded-xl group cursor-pointer flex-1">
              <img
                src={kasol}
                alt="Kasol"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-primary-foreground font-serif text-xl font-semibold">
                  Kasol
                </span>
              </div>
            </div>
          </motion.div>

          {/* Spiti Valley */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="col-span-1 md:col-span-2 row-span-1 relative overflow-hidden rounded-xl group cursor-pointer"
          >
            <img
              src={spiti}
              alt="Spiti Valley"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-primary-foreground font-serif text-xl font-semibold">
                Spiti Valley
              </span>
            </div>
          </motion.div>

          {/* Dharamshala */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="col-span-1 row-span-1 relative overflow-hidden rounded-xl group cursor-pointer"
          >
            <img
              src={dharamshala}
              alt="Dharamshala"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-primary-foreground font-serif text-xl font-semibold">
                Dharamshala
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;





