import React, { useState, useEffect } from "react";
import {
  Trash2,
  Leaf,
  AlertTriangle,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { quizHistoryApi } from "../../services/quizHistoryService";
import useUserStore from "../../stores/userStore";

export const HistoryTemplate = () => {
  const { user } = useUserStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await quizHistoryApi.getQuizHistory(user.userId);
      setHistory(data || []); // Ensure we set an empty array if data is null
    } catch (error) {
      console.error("Error fetching history:", error);
      setHistory([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmation(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation) {
      try {
        // Immediately update UI by removing the item
        setHistory(
          history.filter((item) => item.quizId !== deleteConfirmation)
        );
        setDeleteConfirmation(null);

        // Then perform the API call
        await quizHistoryApi.deleteQuizHistory(deleteConfirmation);
      } catch (error) {
        console.error("Error deleting history:", error);
        // If the API call fails, refresh the list to ensure UI is in sync
        await fetchHistory();
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleQuizClick = async (id) => {
    console.log(id);
    try {
      setDetailLoading(true);
      const detail = await quizHistoryApi.getQuizHistoryDetail(id);
      setSelectedQuiz(detail);
    } catch (error) {
      console.error("Error fetching quiz detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 flex items-center justify-center">
        <div className="text-green-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-green-800 mb-8 flex items-center justify-center">
          <Leaf className="mr-2" /> Eco Quiz History
        </h1>

        {history && history.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-green-200">
            <ul className="divide-y divide-green-200">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="px-4 py-4 sm:px-6 hover:bg-green-50 transition duration-150 ease-in-out"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleQuizClick(item.id)}
                    >
                      <p className="text-sm font-medium text-green-600 truncate hover:text-green-800">
                        {item.quizTitle}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Date: {formatDate(item.createdAt)}
                      </p>
                      <p
                        className={`mt-1 text-sm font-semibold ${getScoreColor(
                          item.score
                        )}`}
                      >
                        Eco Score: {item.score}%
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleDelete(item.quizId)}
                        className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-4 bg-white p-4 rounded-lg shadow">
            <Leaf className="mx-auto h-12 w-12 text-green-500 mb-2" />
            <p>
              No eco quiz history available. Start your green journey today!
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-xl border-2 border-green-500">
            <h2 className="text-xl font-bold mb-4 text-green-800 flex items-center">
              <AlertTriangle className="mr-2 text-yellow-500" /> Confirm
              Deletion
            </h2>
            <p className="mb-4">
              Are you sure you want to delete this eco quiz history item?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-150 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-150 ease-in-out flex items-center"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Detail Modal */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl border-2 border-green-500 w-full max-w-2xl m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-green-800 flex items-center">
                <Leaf className="mr-2" /> {selectedQuiz.quizTitle}
              </h2>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Date: {formatDate(selectedQuiz.createdAt)}
              </p>
              <p
                className={`text-lg font-bold ${getScoreColor(
                  selectedQuiz.score
                )}`}
              >
                Final Score: {selectedQuiz.score}%
              </p>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedQuiz.questions.map((q, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <p className="font-medium mb-2">
                    {index + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 gap-2 ml-4">
                    {q.choices.map((choice, choiceIndex) => (
                      <div
                        key={choiceIndex}
                        className={`p-2 rounded ${
                          choice === q.correctAnswer
                            ? "bg-green-100 text-green-800"
                            : choice === q.userAnswer &&
                              choice !== q.correctAnswer
                            ? "bg-red-100 text-red-800"
                            : "bg-white"
                        }`}
                      >
                        {choice}
                        {choice === q.correctAnswer && (
                          <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-600" />
                        )}
                        {choice === q.userAnswer &&
                          choice !== q.correctAnswer && (
                            <XCircle className="inline-block ml-2 h-4 w-4 text-red-600" />
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedQuiz(null)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-150 ease-in-out"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTemplate;
