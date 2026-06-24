import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Home from "./pages/Home";
import CrowdPrediction from "./pages/CrowdPrediction";
import ItineraryPlanner from "./pages/ItineraryPlanner";
import SmartRecommend from "./pages/SmartRecommend";


import StatePage from "./pages/StatePage";
import LocationPage from "./pages/LocationPage";
import NotFound from "./pages/NotFound";

import Chatbot from "./components/chatbot/Chatbot";

// Scroll to top on route change
// This handles smooth scrolling to top for a better user experience
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <HashRouter>
      <ScrollToTop />

      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Travel Planner */}
        <Route path="/planner" element={<ItineraryPlanner />} />

        {/* Crowd Forecasts */}
        <Route path="/prediction" element={<CrowdPrediction />} />

        {/* AI Recommendation Engine */}
        <Route path="/recommend" element={<SmartRecommend />} />

        {/* State Pages */}
        <Route
          path="/state/:stateName"
          element={<StatePage />}
        />

        {/* Location Pages */}
        <Route
          path="/state/:stateName/location/:locationName"
          element={<LocationPage />}
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Chatbot */}
      <Chatbot />
    </HashRouter>
  );
}

export default App;