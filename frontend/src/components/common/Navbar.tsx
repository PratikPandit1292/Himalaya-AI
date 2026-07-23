import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import AuthModal from "@/components/common/AuthModal";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-md py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link
              to="/"
              className={`font-medium transition-colors duration-300 link-underline ${
                isScrolled
                  ? "text-foreground hover:text-primary"
                  : "text-primary-foreground/90 hover:text-primary-foreground"
              }`}
            >
              Home
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/state/sikkim"
                  className={`font-medium transition-colors duration-300 link-underline ${
                    isScrolled
                      ? "text-foreground hover:text-primary"
                      : "text-primary-foreground/90 hover:text-primary-foreground"
                  }`}
                >
                  Sikkim
                </Link>

                <Link
                  to="/state/himachal-pradesh"
                  className={`font-medium transition-colors duration-300 link-underline ${
                    isScrolled
                      ? "text-foreground hover:text-primary"
                      : "text-primary-foreground/90 hover:text-primary-foreground"
                  }`}
                >
                  Himachal Pradesh
                </Link>

                <Link
                  to="/planner"
                  className={`font-medium transition-colors duration-300 link-underline ${
                    isScrolled
                      ? "text-foreground hover:text-primary"
                      : "text-primary-foreground/90 hover:text-primary-foreground"
                  }`}
                >
                  Plan Trip
                </Link>

                <Link
                  to="/prediction"
                  className={`font-medium transition-colors duration-300 link-underline ${
                    isScrolled
                      ? "text-foreground hover:text-primary"
                      : "text-primary-foreground/90 hover:text-primary-foreground"
                  }`}
                >
                  Crowd Forecasts
                </Link>

                <Link
                  to="/recommend"
                  className={`font-medium transition-colors duration-300 link-underline ${
                    isScrolled
                      ? "text-foreground hover:text-primary"
                      : "text-primary-foreground/90 hover:text-primary-foreground"
                  }`}
                >
                  AI Recommends
                </Link>
              </>
            )}
          </div>

          {/* Auth + Mobile Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <AuthModal />
            </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 transition-colors duration-300 ${
              isScrolled ? "text-foreground" : "text-primary-foreground"
            }`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-background shadow-lg"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              <Link
              to="/"
              className={`font-medium transition-colors duration-300 link-underline ${
                isScrolled
                  ? "text-foreground hover:text-primary"
                  : "text-primary-foreground/90 hover:text-primary-foreground"
              }`}
            >
              Home
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/state/sikkim"
                  className={`font-medium transition-colors duration-300 link-underline ${
                    isScrolled
                      ? "text-foreground hover:text-primary"
                      : "text-primary-foreground/90 hover:text-primary-foreground"
                  }`}
                >
                  Sikkim
                </Link>

                <Link
                  to="/state/himachal-pradesh"
                  className={`font-medium transition-colors duration-300 link-underline ${
                    isScrolled
                      ? "text-foreground hover:text-primary"
                      : "text-primary-foreground/90 hover:text-primary-foreground"
                  }`}
                >
                  Himachal Pradesh
                </Link>

                <Link
                  to="/planner"
                  className={`font-medium transition-colors duration-300 link-underline ${
                    isScrolled
                      ? "text-foreground hover:text-primary"
                      : "text-primary-foreground/90 hover:text-primary-foreground"
                  }`}
                >
                  Plan Trip
                </Link>

                <Link
                  to="/prediction"
                  className={`font-medium transition-colors duration-300 link-underline ${
                    isScrolled
                      ? "text-foreground hover:text-primary"
                      : "text-primary-foreground/90 hover:text-primary-foreground"
                  }`}
                >
                  Crowd Forecasts
                </Link>

                <Link
                  to="/recommend"
                  className={`font-medium transition-colors duration-300 link-underline ${
                    isScrolled
                      ? "text-foreground hover:text-primary"
                      : "text-primary-foreground/90 hover:text-primary-foreground"
                  }`}
                >
                  AI Recommends
                </Link>
              </>
            )}

              <div className="pt-2 border-t border-border">
                <AuthModal />
              </div>

            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
