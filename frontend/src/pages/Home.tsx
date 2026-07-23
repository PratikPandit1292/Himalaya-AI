import { useState } from "react";
import Navbar from "@/components/common/Navbar";
import HeroSection from "@/components/common/HeroSection";
import FeaturedStates from "@/components/common/FeaturedStates";
import WhyTravelSection from "@/components/common/WhyTravelSection";
import GallerySection from "@/components/common/GallerySection";
import Footer from "@/components/common/Footer";
import AuthModal from "@/components/common/AuthModal";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const handleInteract = () => {
    if (!isAuthenticated) setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-background" onClickCapture={handleInteract}>
      <Navbar />
      <HeroSection />
      <FeaturedStates />
      <WhyTravelSection />
      <GallerySection />
      <Footer />
      {showAuth && <AuthModal onAuthChange={() => setShowAuth(false)} />}
    </div>
  );
};

export default Home;
