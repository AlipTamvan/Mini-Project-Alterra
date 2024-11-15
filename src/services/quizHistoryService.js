import { firestore } from "../config/firebase.config"; // Pastikan Anda mengimpor firestore
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

const quizHistoryCollection = collection(firestore, "quizHistory");

export const quizHistoryApi = {
  // Insert Quiz To History
  saveQuizHistory: async (quizData) => {
    try {
      const docRef = await addDoc(quizHistoryCollection, quizData); // Simpan data kuis
      return docRef; // Kembalikan referensi dokumen
    } catch (error) {
      console.error("Error saving quiz history:", error);
      throw error; // Lempar error agar bisa ditangani di tempat lain
    }
  },

  // Get all quiz history for a user
  getQuizHistory: async (userId) => {
    try {
      const q = query(quizHistoryCollection, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return history;
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      throw error;
    }
  },

  // Get specific quiz history detail
  getQuizHistoryDetail: async (historyId) => {
    try {
      const docRef = doc(quizHistoryCollection, historyId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error("Quiz history not found");
      }
    } catch (error) {
      console.error("Error fetching quiz history detail:", error);
      throw error;
    }
  },

  // Delete quiz history
  deleteQuizHistory: async (historyId) => {
    try {
      const docRef = doc(quizHistoryCollection, historyId);
      await deleteDoc(docRef);
      return { id: historyId }; // Mengembalikan ID yang dihapus
    } catch (error) {
      console.error("Error deleting quiz history:", error);
      throw error;
    }
  },
};
