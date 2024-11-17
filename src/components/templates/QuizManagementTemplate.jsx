import React, { useState } from "react";
// import generateContent from "../../services/googleGenerativeAiService";
import generateContent from "../../services/openRouterAiService";
import { quizHistoryApi } from "../../services/quizHistoryService";
import useUserStore from "../../stores/userStore";
import Swal from "sweetalert2";
import { getAuth } from "firebase/auth";
import { userApi } from "../../services/userService";
import { Send } from "lucide-react";
import fairy from "../../assets/img/fairy-holding-magic-ball.png";

export const QuizManagementTemplate = () => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [showNewQuizButton, setShowNewQuizButton] = useState(false);

  const [description, setDescription] = useState(
    "Meet Gaia, the Eco Fairy! She's here to guide you through our environmental quiz adventure. With her magical orb, she crafts unique questions to test your eco-knowledge. Are you ready to embark on a green journey of discovery?"
  );

  const user = useUserStore((state) => state.user);

  const cleanResponseText = (text) => {
    const jsonStartIndex = text.indexOf("{");
    const jsonEndIndex = text.lastIndexOf("}") + 1;
    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
      console.error("JSON not found in response:", text);
      return "";
    }
    const jsonText = text.slice(jsonStartIndex, jsonEndIndex);
    return jsonText;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const checkEcoRelevance = async (input) => {
      const relevancePrompt = `Is the following input related to environmental issues? "${input}" Please respond with "yes" or "no".`;
      const result = await generateContent(relevancePrompt);
      return result && result.toLowerCase().includes("yes");
    };

    try {
      const isRelevant = await checkEcoRelevance(input);

      if (!isRelevant) {
        setDescription(
          "Oops! Gaia's magic orb can't conjure quizzes on that topic. Try an eco-friendly question instead!"
        );

        setLoading(false);
        return;
      }

      let prompt = `Create a unique and engaging quiz in English on the topic "${input}".
        Ensure that all questions are related to environmental issues, particularly focusing on aspects like water conservation, pollution, and sustainability.
        Incorporate the term "Quiz" within the context.
        Return the output in JSON format, featuring an array called "questions" that contains 10 unique and diverse questions related to "${input}".
        Each question must consist of "question", "options" (an array of possible answers), and "correctIndex" (the index of the correct answer).
        Ensure that every question presents a distinct context, and no two questions should be identical, even when the same topic is requested.
        Use different styles and formats to make the quiz more interesting, and include random elements or scenarios in the questions to enhance their uniqueness.
        Additionally, ensure that the questions are crafted in such a manner that they do not repeat across various requests for the same topic.`;

      //       let prompt = `Create a unique, engaging, and informative quiz in English on the topic "${input}".
      // Ensure that all questions are relevant to environmental issues, with a primary focus on water conservation, pollution, sustainability, climate change, renewable energy, and biodiversity protection.
      // Each question should highlight both practical and theoretical aspects, encouraging awareness of the importance of real-world actions to protect the environment.
      // Incorporate the term "Quiz" naturally and clearly within the context.

      // Return the output in JSON format, containing an array named "questions" with 10 unique and diverse questions related to "${input}".
      // Each question should follow this structure:
      // - "question": The question description.
      // - "options": An array of four possible answers (ensure the options are relevant and diverse).
      // - "correctIndex": The index of the correct answer.

      // Ensure the following:
      // 1. Each question presents a different context, such as real-world scenarios, case studies, or hypothetical situations.
      // 2. No two questions are identical, even when the same topic is requested.
      // 3. The questions are crafted using various styles and formats, such as multiple-choice, interactive scenarios, or trivia.
      // 4. Creative and random elements are incorporated to enhance the uniqueness and appeal of each question.

      // Add an educational dimension by including details such as statistics, scientific facts, or real-life examples related to "${input}" to enrich the learning value of the quiz.
      // Ensure the quiz is designed to encourage critical thinking and deepen participants' understanding of environmental issues.`;

      const result = await generateContent(prompt);
      console.log("Raw response from AI:", result); // Log raw response

      if (result) {
        const cleanResult = cleanResponseText(result);
        console.log("Cleaned response:", cleanResult); // Log cleaned response

        try {
          if (isValidJSON(cleanResult)) {
            const parsedQuestions = JSON.parse(cleanResult);
            setQuestions(parsedQuestions.questions);
            setHistory([
              ...history,
              { prompt: input, response: "Quiz created successfully!" },
            ]);
            setShowQuiz(true);
            setDescription(
              "*Gaia's orb glows brightly* Eco-luminos Quizardium! Your enchanted eco-quiz has sprouted from the orb's light! Nurture it with wisdom and watch your knowledge bloom!"
            );
          } else {
            throw new Error("Invalid JSON format");
          }
        } catch (parseError) {
          console.error("Error parsing quiz JSON:", parseError);
        }
      } else {
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
    }
    setLoading(false);
    setInput("");
  };

  const isValidJSON = (str) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false; // Jika parsing gagal, kembalikan false
    }
    return true; // Jika parsing berhasil, kembalikan true
  };

  const handleAnswer = (questionIndex, value) => {
    setAnswers({ ...answers, [questionIndex]: parseInt(value) });
  };

  const calculateScore = async () => {
    setIsUpdatingScore(true);
    setShowSaveButton(false);
    setShowNewQuizButton(false);

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

      // Fetch updated user data
      const updatedUser = await userApi.getUserById(user.userId);
      useUserStore.getState().setUser(updatedUser);

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

      // Show Save and New Quiz buttons after score is updated
      setShowSaveButton(true);
      setShowNewQuizButton(true);
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
    setShowSaveButton(false);
    setShowNewQuizButton(false);
    setDescription(
      "Meet Gaia, the Eco Fairy! She's here to guide you through our environmental quiz adventure. With her magical orb, she crafts unique questions to test your eco-knowledge. Are you ready to embark on a green journey of discovery?"
    );
  };

  const saveQuiz = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Swal.fire({
        icon: "error",
        title: "Not Authenticated",
        text: "You must be logged in to save a quiz.",
      });
      return;
    }

    const formattedQuestions = questions.map((question, index) => {
      return {
        question: question.question || "No question provided",
        choices: question.options || [],
        correctAnswer:
          question.options[question.correctIndex] || "No correct answer",
        userAnswer: question.options[answers[index]] || "No user answer",
      };
    });

    const quizData = {
      quizTitle: history[history.length - 1]?.prompt || "Untitled Quiz",
      questions: formattedQuestions,
      score: score || 0,
      totalQuestions: questions.length || 0,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };

    console.log("Quiz Data to be saved:", quizData);

    try {
      const response = await quizHistoryApi.saveQuizHistory(quizData);
      console.log("Quiz saved successfully:", response);
      Swal.fire({
        icon: "success",
        title: "Adding Quiz",
        text: "Quiz saved successfully!",
        confirmButtonColor: "#10B981",
        background: "#ECFDF5",
        iconColor: "#059669",
      });
    } catch (error) {
      console.error("Failed to save quiz:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while saving the quiz.",
        confirmButtonColor: "#EF4444",
        background: "#FEE2E2",
        iconColor: "#DC2626",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center mb-6">
          <img
            src={fairy}
            alt="Eco Fairy"
            className="w-40 h-40 rounded-full border-4 border-green-300 shadow-lg mb-4"
          />
          <p className="text-center text-sm text-gray-600 max-w-md">
            {description}
          </p>
        </div>
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
                    placeholder="Enter quiz topic (use the keyword 'quiz')"
                    className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                    disabled={loading}
                  >
                    <Send className="w-5 h-5 " />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">
                Quiz: {history[history.length - 1]?.prompt}
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
                          checked={answers[qIndex] === oIndex} //membandingkan jawaban untuk pertanyaan tertentu dengan opsi tertentu.
                        />
                        <label>{option}</label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex flex-col md:flex-row justify-between items-center">
                {score === null ? (
                  <button
                    onClick={calculateScore}
                    disabled={isUpdatingScore}
                    className={`bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md ${
                      isUpdatingScore ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isUpdatingScore ? "Saving Score..." : "Finish Quiz"}
                  </button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="font-medium">Score:</div>
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
                  </>
                )}

                <div className="flex flex-col-2 md:flex-row mt-4 md:mt-0 space-x-4">
                  {score !== null && showSaveButton && (
                    <button
                      onClick={saveQuiz}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md md:mb-0 md:mr-2"
                    >
                      Save Quiz
                    </button>
                  )}
                  {score !== null && showNewQuizButton && (
                    <button
                      onClick={resetQuiz}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
                    >
                      New Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="mt-4 p-4 bg-green-100 rounded-lg text-green-700">
              <p>
                Gaia's orb is weaving eco-wisdom into unique quiz questions...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizManagementTemplate;
