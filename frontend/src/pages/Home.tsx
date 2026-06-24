import Navbar from "@/components/common/Navbar";
import HeroSection from "@/components/common/HeroSection";
import FeaturedStates from "@/components/common/FeaturedStates";
import WhyTravelSection from "@/components/common/WhyTravelSection";
import GallerySection from "@/components/common/GallerySection";
import Footer from "@/components/common/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturedStates />
      <WhyTravelSection />
      <GallerySection />
      <Footer />
    </div>
  );
};

export default Home;
