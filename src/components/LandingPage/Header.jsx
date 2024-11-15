import { Link } from "react-router-dom";
import { useState } from "react";
import { Leaf, User, LogOut, BookOpen, History, Trophy } from "lucide-react";
import useUserStore from "../../stores/userStore";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated, logout, user } = useUserStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-green-500 text-white p-4 md:p-6">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center">
          <Leaf className="mr-2" /> EcoQuiz
        </h1>
        <nav className="flex items-center">
          <ul className="flex space-x-4 items-center">
            {!isAuthenticated ? (
              <li>
                <Link
                  to="/login"
                  className="hover:underline text-lg md:text-2lg border text-center border-white px-4 py-2 rounded"
                >
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
                      className=" px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Quiz
                    </Link>
                    <Link
                      to="/history"
                      className=" px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center"
                    >
                      <History className="w-4 h-4 mr-2" />
                      History
                    </Link>
                    <Link
                      to="profile"
                      className=" px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center"
                    >
                      <History className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/leaderboard"
                      className=" px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Leaderboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className=" w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 flex items-center"
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
  );
};

export default Header;
