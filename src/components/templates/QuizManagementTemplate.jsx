import React, { useState } from "react";
import generateContent from "../../services/googleGenerativeAiService";
import { quizHistoryApi } from "../../services/quizHistoryService";
import useUserStore from "../../stores/userStore";
import Swal from "sweetalert2";
import { userApi } from "../../services/userService";

export const QuizManagementTemplate = () => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [quizSaved, setQuizSaved] = useState(false);
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);

  const user = useUserStore((state) => state.user);

  const cleanResponseText = (text) => {
    const jsonStartIndex = text.indexOf("{");
    const jsonEndIndex = text.lastIndexOf("}") + 1;
    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
      console.error("JSON tidak ditemukan dalam respons:", text);
      return "";
    }
    const jsonText = text.slice(jsonStartIndex, jsonEndIndex);
    return jsonText;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const prompt = `Buatkan kuis dalam bahasa Indonesia tentang topik ${input}. Berikan respons dalam format JSON dengan array "questions" yang berisi 10 soal dengan "question", "options" (array pilihan jawaban), dan "correctIndex" (indeks jawaban benar). Pastikan semua soal BERBEDA dan bervariasi dalam topik yang relevan.`;

    // const prompt = `Buatkan kuis dalam bahasa Indonesia tentang topik ${input}. Berikan respons dalam format JSON dengan array "questions" yang berisi "question", "options" (array pilihan jawaban), dan "correctIndex" (indeks jawaban benar).`;
    try {
      const result = await generateContent(prompt);
      if (result) {
        console.log("Respons mentah dari AI:", result); // Debugging
        const cleanResult = cleanResponseText(result);
        console.log("Respons yang telah dibersihkan:", cleanResult); // Debugging
        try {
          const parsedQuestions = JSON.parse(cleanResult);
          setQuestions(parsedQuestions.questions);
          setHistory([
            ...history,
            { prompt: input, response: "Kuis berhasil dibuat!" },
          ]);
          setShowQuiz(true);
        } catch (parseError) {
          console.error("Error parsing quiz JSON:", parseError);
          setHistory([
            ...history,
            { prompt: input, response: "Format kuis tidak valid. Coba lagi." },
          ]);
        }
      } else {
        setHistory([
          ...history,
          {
            prompt: input,
            response: "Maaf, terjadi kesalahan saat membuat kuis.",
          },
        ]);
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
    }
    setLoading(false);
    setInput("");
  };

  const handleAnswer = (questionIndex, value) => {
    setAnswers({ ...answers, [questionIndex]: parseInt(value) });
  };

  const calculateScore = async () => {
    setIsUpdatingScore(true);
    try {
      let correct = 0;
      questions.forEach((question, index) => {
        if (answers[index] === question.correctIndex) {
          correct++;
        }
      });

      const calculatedScore = (correct / questions.length) * 100;
      setScore(calculatedScore);

      // Update user's total score
      await userApi.updateUserScore(user.userId, calculatedScore);

      // Ambil data pengguna terbaru
      const updatedUser = await userApi.getUserById(user.userId);
      useUserStore.getState().setUser(updatedUser); // Memperbarui state global

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Score Updated",
        text: `Your score has been recorded! Current quiz score: ${calculatedScore.toFixed(
          0
        )}%`,
        confirmButtonColor: "#10B981",
        background: "#ECFDF5",
        iconColor: "#059669",
      });
    } catch (error) {
      console.error("Error updating score:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update your score. Please try again.",
        confirmButtonColor: "#EF4444",
        background: "#FEE2E2",
        iconColor: "#DC2626",
      });
    } finally {
      setIsUpdatingScore(false);
    }
  };

  const resetQuiz = () => {
    setShowQuiz(false);
    setQuestions([]);
    setAnswers({});
    setScore(null);
    setQuizSaved(false); // Reset status penyimpanan kuis
  };

  const saveQuiz = async () => {
    const formattedQuestions = questions.map((question, index) => ({
      question: question.question,
      choices: question.options,
      correctAnswer: question.options[question.correctIndex],
      userAnswer: question.options[answers[index]],
    }));

    const quizData = {
      quizTitle: history[history.length - 1]?.prompt,
      questions: formattedQuestions,
      score,
      totalQuestions: questions.length,
      userId: user.userId,
    };

    try {
      const response = await quizHistoryApi.saveQuizHistory(quizData);
      console.log("Kuis berhasil disimpan:", response);
      setQuizSaved(true); // Tandai bahwa kuis telah disimpan
      Swal.fire({
        icon: "success",
        title: "Menambahkan Quiz",
        text: "Berhasil Menyimpan Quiz!",
        confirmButtonColor: "#10B981",
        background: "#ECFDF5",
        iconColor: "#059669",
      });
    } catch (error) {
      console.error("Gagal menyimpan kuis:", error);
      alert("Terjadi kesalahan saat menyimpan kuis.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-2xl font-bold text-center text-green-700 mb-4">
          Eco Quiz
        </div>
        <div>
          {!showQuiz ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Masukkan topik kuis (gunakan kata kunci 'kuis')"
                    className="flex-grow p-2 border border-gray-300 rounded-md"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                  >
                    Buat Kuis
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                Kuis: {history[history.length - 1]?.prompt}
              </h2>

              {questions.map((question, qIndex) => (
                <div
                  key={qIndex}
                  className="p-4 bg-white rounded-lg shadow-md mb-4"
                >
                  <div className="font-medium">
                    {qIndex + 1}. {question.question}
                  </div>
                  <div className="space-y-2 mt-2">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value={oIndex}
                          name={`question-${qIndex}`}
                          onChange={() => handleAnswer(qIndex, oIndex)}
                          checked={answers[qIndex] === oIndex}
                        />
                        <label>{option}</label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center">
                {score === null ? (
                  <button
                    onClick={calculateScore}
                    disabled={isUpdatingScore}
                    className={`bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md ${
                      isUpdatingScore ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isUpdatingScore ? "Menyimpan Score..." : "Selesai Kuis"}
                  </button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="font-medium">Nilai:</div>
                      <div className="w-[200px] bg-gray-200 h-4 rounded-md">
                        <div
                          className="bg-green-500 h-full rounded-md"
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <div className="text-lg font-bold">
                        {score.toFixed(0)}%
                      </div>
                    </div>
                    <button
                      onClick={resetQuiz}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                    >
                      Kuis Baru
                    </button>
                  </>
                )}
                {score !== null && !quizSaved && (
                  <button
                    onClick={saveQuiz}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md"
                  >
                    Simpan Kuis
                  </button>
                )}
              </div>
            </div>
          )}

          {loading && (
            <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
              <p className="text-gray-800">Membuat soal kuis unik...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizManagementTemplate;
