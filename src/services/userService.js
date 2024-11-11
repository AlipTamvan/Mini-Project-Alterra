// src/service/ApiService.js

import axios from "axios";
import { auth0Client } from "../config/auth0.config";

const BASE_URL = "https://672b66671600dda5a9f4da1f.mockapi.io/";

export const userApi = {
  getUsers: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axios.post(`${BASE_URL}/users`, userData);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  loginUser: async (email, password) => {
    try {
      const users = await userApi.getUsers(); // Ambil semua pengguna
      const user = users.find(
        (user) => user.email === email && user.password === password
      );
      return user; // Kembalikan pengguna jika ditemukan
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(`${BASE_URL}/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/users/${userId}`);
      return response.data; // Mengembalikan data pengguna
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error; // Melempar error agar bisa ditangani di tempat lain
    }
  },

  updateUserScore: async (userId, newScore) => {
    try {
      // First get the current user data
      const response = await axios.get(`${BASE_URL}/users/${userId}`);
      const currentUser = response.data;

      // Calculate new total score
      const currentScore = currentUser.scores || 0;
      const updatedScore = currentScore + newScore;

      // Update user with new score
      const updateResponse = await axios.put(`${BASE_URL}/users/${userId}`, {
        ...currentUser,
        scores: updatedScore,
      });

      return updateResponse.data;
    } catch (error) {
      console.error("Error updating user score:", error);
      throw error;
    }
  },

   // Get all Total Users
   getTotalUsers: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users`);
      return response.data.length; // Returns the total number of users
    } catch (error) {
      console.error("Error fetching total users:", error);
      throw error;
    }
  },
};
