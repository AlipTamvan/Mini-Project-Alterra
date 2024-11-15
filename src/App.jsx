import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LandingPage } from "./components/pages/LandingPage";
import { LoginPage } from "./components/pages/LoginPage";
import { useState, useEffect } from "react";
import { PrivateRoute } from "./components/PrivateRoute/PrivateRoute";
import { RegisterPage } from "./components/pages/RegisterPage";
import { QuizManagementPage } from "./components/pages/QuizManagementPage";
import { ProfilePage } from "./components/pages/ProfilePage";
import { HistoryPage } from "./components/pages/HistoryPage";
import { LeaderboardPage } from "./components/pages/LeaderboardPage";
import { ResetPasswordPage } from "./components/pages/ResetPasswordPage";

// import { Auth0Provider } from "@auth0/auth0-react";
// import { auth0Client } from "./config/auth0.config";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);
  }, []);

  const handleLogin = () => {
    localStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.setItem("isAuthenticated", "false");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/quiz" element={<QuizManagementPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
