// src/service/ApiService.js

import { firebaseAuth, firestore } from "../config/firebase.config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

const usersCollection = collection(firestore, "users");

export const userApi = {
  getUsers: async () => {
    try {
      const querySnapshot = await getDocs(usersCollection);
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        userData.email,
        userData.password
      );
      const userId = userCredential.user.uid;

      // Kirim email verifikasi
      await sendEmailVerification(userCredential.user);

      // Tambahkan userId ke userData
      const userWithId = { ...userData, userId }; // Menambahkan userId ke data pengguna

      await setDoc(doc(usersCollection, userId), userWithId);
      return { id: userId, ...userWithId }; // Mengembalikan user dengan userId
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        console.error("Email sudah terdaftar:", error);
        throw new Error("Email sudah terdaftar. Silakan gunakan email lain.");
      } else {
        console.error("Error creating user:", error);
        throw error;
      }
    }
  },
  loginUser: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const userId = userCredential.user.uid;

      // Ambil data pengguna dari Firestore
      const userDoc = await getDoc(doc(firestore, "users", userId));
      if (userDoc.exists()) {
        return { id: userId, ...userDoc.data() };
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },
  updateUser: async (userId, userData) => {
    try {
      const userRef = doc(usersCollection, userId); // Menggunakan userId yang benar
      await updateDoc(userRef, userData);
      const updatedUserDoc = await getDoc(userRef);
      return updatedUserDoc.data();
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      const userDoc = await getDoc(doc(usersCollection, userId));
      if (userDoc.exists()) {
        return { id: userId, ...userDoc.data() };
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  },

  updateUserScore: async (userId, newScore) => {
    try {
      const userDoc = await getDoc(doc(usersCollection, userId));
      if (!userDoc.exists()) throw new Error("User not found");

      const currentUser = userDoc.data();
      const currentScore = currentUser.scores || 0;
      const updatedScore = currentScore + newScore;

      await updateDoc(doc(usersCollection, userId), { scores: updatedScore });

      return { ...currentUser, scores: updatedScore };
    } catch (error) {
      console.error("Error updating user score:", error);
      throw error;
    }
  },

  getTotalUsers: async () => {
    try {
      const querySnapshot = await getDocs(usersCollection);
      return querySnapshot.size;
    } catch (error) {
      console.error("Error fetching total users:", error);
      throw error;
    }
  },
};
