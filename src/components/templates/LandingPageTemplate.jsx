import Header from "../LandingPage/Header";
import WelcomeSection from "../LandingPage/WelcomeSection";
import EnvironmentalTopics from "../LandingPage/EnvironmentalTopics";
import EnvironmentalFacts from "../LandingPage/EnvironmentalFacts";
import Footer from "../LandingPage/Footer";

import useUserStore from "../../stores/userStore";

const LandingPageTemplate = () => {
  const { isAuthenticated } = useUserStore();
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <WelcomeSection isAuthenticated={isAuthenticated} />
        <EnvironmentalTopics />
        <EnvironmentalFacts />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPageTemplate;
