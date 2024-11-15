import React, { useState, useEffect } from "react";
import { userApi } from "../../services/userService";
import { Trophy, Leaf, TreeDeciduous, Sprout, UserCircle } from "lucide-react";

const LeaderboardItem = ({ rank, name, score, avatar, avatarPublicId }) => {
  const rankColors = {
    1: "bg-yellow-400",
    2: "bg-gray-300",
    3: "bg-yellow-600",
  };

  return (
    <div
      className={`flex items-center p-4 ${
        rank <= 3 ? "bg-green-100" : "bg-white"
      } rounded-lg shadow-md mb-4 transition-transform hover:scale-105`}
    >
      <div
        className={`${
          rankColors[rank] || "bg-green-500"
        } text-white rounded-full w-10 h-10 flex items-center justify-center mr-4`}
      >
        {rank}
      </div>
      {avatar.length || avatarPublicId.length ? (
        <img
          src={avatar}
          alt={name}
          className="w-12 h-12 rounded-full mr-4 border-2 border-green-500"
        />
      ) : (
        <UserCircle className="w-10 h-10 text-green-500 mr-4" />
      )}

      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-green-800">{name}</h3>
        <p className="text-sm text-green-600">Eco Score: {score}</p>
      </div>
      <div className="flex items-center">
        <Leaf className="w-5 h-5 text-green-500 mr-1" />
        <span className="text-lg font-bold text-green-700">{score}</span>
      </div>
    </div>
  );
};

export const LeaderboardTemplate = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch user data
        const users = await userApi.getUsers();

        // Sort users by score in descending order and get the top 10
        const topUsers = users.sort((a, b) => b.scores - a.scores).slice(0, 10);

        setLeaderboardData(topUsers);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-green-800 mb-8 flex items-center justify-center">
          <Trophy className="mr-2 text-yellow-500" /> Eco Champions Leaderboard
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-green-700 flex items-center">
                  <TreeDeciduous className="mr-2" /> Top Eco Warriors
                </h2>
                <Sprout className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-gray-600 mb-4">
                These eco-champions are leading the way in environmental
                awareness and action. Join them in making a difference!
              </p>
            </div>

            <div className="space-y-4">
              {leaderboardData.map((player, index) => (
                <LeaderboardItem
                  key={player.id}
                  rank={index + 1}
                  name={player.username}
                  score={player.scores}
                  avatar={player.avatar}
                  avatarPublicId={player.avatarPublicId}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
