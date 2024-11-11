import axios from "axios";

const BASE_URL = "https://672b66671600dda5a9f4da1f.mockapi.io";

// Fungsi untuk menyimpan riwayat kuis ke MockAPI

export const quizHistoryApi = {
  //Insert Quiz To History
  saveQuizHistory: async (quizData) => {
    try {
      const response = await axios.post(`${BASE_URL}/quizHistory`, quizData);
      return response.data;
    } catch (error) {
      console.error("Error saving quiz history:", error);
      throw error;
    }
  },

  // Get all quiz history for a user
  getQuizHistory: async (userId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/quizHistory?userId=${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      throw error;
    }
  },

  // Get specific quiz history detail
  getQuizHistoryDetail: async (historyId) => {
    try {
      const response = await axios.get(`${BASE_URL}/quizHistory/${historyId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching quiz history detail:", error);
      throw error;
    }
  },

  // Delete quiz history
  deleteQuizHistory: async (historyId) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/quizHistory/${historyId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting quiz history:", error);
      throw error;
    }
  },

 
};
