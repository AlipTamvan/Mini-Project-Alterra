import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Leaf,
  Droplet,
  Sun,
  Wind,
  Recycle,
  User,
  History,
  LogOut,
  BookOpen,
  Trophy,
} from "lucide-react";
import useUserStore from "../../stores/userStore";
import earth from "../../assets/img/earth.png";
import { userApi } from "../../services/userService";
import { quizHistoryApi } from "../../services/quizHistoryService";

export const LandingPageTemplate = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated, logout, user } = useUserStore();
  const [totalUsers, setTotalUsers] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState(0);

  useEffect(() => {
    // Fetch total users
    const fetchTotalUsers = async () => {
      try {
        const response = await userApi.getTotalUsers(); // Assuming this endpoint returns the total users
        setTotalUsers(response.data.totalUsers);
      } catch (error) {
        console.error("Failed to fetch total users:", error);
      }
    };

    fetchTotalUsers();
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("user-storage");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100">
      <header className="bg-green-500 text-white p-4 md:p-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <Leaf className="mr-2" /> EcoQuiz
          </h1>
          <nav className="flex items-center">
            <ul className="flex space-x-4 items-center">
              {!isAuthenticated ? (
                <li>
                  <Link to="/login" className="hover:underline">
                    Login
                  </Link>
                </li>
              ) : (
                <li className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors">
                      <User className="w-6 h-6" />
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/quiz"
                        className="block px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Quiz
                      </Link>
                      <Link
                        to="/history"
                        className="block px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center"
                      >
                        <History className="w-4 h-4 mr-2" />
                        History
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <Link
                        to="/leaderboard"
                        className="block px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Leaderboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div className="text-center md:text-left md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-bold text-green-700">
              Welcome to EcoQuiz World!
            </h2>
            <p className="text-lg mt-4 mb-8">
              Discover the fascinating world of ecology through interactive
              quizzes. Learn about environmental conservation, biodiversity, and
              sustainable practices while testing your knowledge and having fun!
            </p>
            <Link
              to={isAuthenticated ? "/quiz" : "/login"}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 transform hover:scale-105 inline-block"
            >
              {isAuthenticated ? "Create a Quiz" : "Start Learning"}
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
            <img
              src={earth}
              alt="Earth"
              className="w-72 h-auto md:w-96 md:h-auto animate-spin-slow"
            />
          </div>
        </section>
        {/* <section id="stats" className="mb-12">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center 0">
              <div className=" flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-20">
                <h3 className="text-2xl font-bold text-green-600 ">500</h3>
                <p className="text-gray-600">Eco-Learners</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center ">
              <div className=" flex flex-col items-center justify-center hover:scale-105 transition-transform duration-200">
                <h3 className="text-2xl font-bold text-green-600 transform ">
                  50
                </h3>
                <p className="text-gray-600">Eco-Learners</p>
              </div>
            </div>
          </div>
        </section> */}

        {/* Section: Environmental Topics */}
        <section id="intro" className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-green-700">
            Environmental Topics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Droplet, title: "Water", desc: "Water Conservation" },
              { icon: Sun, title: "Energy", desc: "Renewable Energy" },
              { icon: Wind, title: "Air", desc: "Air Quality" },
              { icon: Recycle, title: "Recycle", desc: "Waste Management" },
            ].map(({ icon: Icon, title, desc }, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-200"
              >
                <Icon className="text-green-500 mb-2" size={40} />
                <span className="text-sm font-medium text-gray-600">
                  {title}
                </span>
                <span className="text-xs text-gray-500">{desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Environmental Facts */}
        <section id="facts" className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-green-700">
            Environmental Facts
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "The Amazon rainforest produces 20% of the world's oxygen.",
              "Over 8 million tons of plastic end up in our oceans every year.",
              "A single tree can absorb up to 48 pounds of CO2 per year.",
              "The Earth loses 18.7 million acres of forests annually.",
            ].map((fact, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-2 text-green-600">
                  Fact #{index + 1}
                </h3>
                <p>{fact}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-green-500 text-white p-4 ">
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">EcoQuiz</h3>
            <p className="text-sm">
              Empowering eco-warriors through knowledge and fun quizzes.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              ></a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              ></a>
            </div>
          </div>
        </div> */}
        <div className="border-t border-green-500 pt-6 text-center">
          <p>&copy; 2024 EcoQuiz. Let's protect our Earth together!</p>
          <p className="mt-2 text-sm">Made with 💚 by Aliva</p>
        </div>
      </footer>
    </div>
  );
};
