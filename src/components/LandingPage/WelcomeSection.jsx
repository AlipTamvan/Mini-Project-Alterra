import { Link } from "react-router-dom";
import earth from "../../assets/img/earth.png";

const WelcomeSection = ({ isAuthenticated }) => {
  return (
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
  );
};

export default WelcomeSection;