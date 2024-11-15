import React, { useState } from "react";
import { firebaseAuth } from "../../config/firebase.config"; // Pastikan Anda mengimpor firebaseAuth
import { sendPasswordResetEmail } from "firebase/auth"; // Import fungsi ini

export const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Reset message
    setError(""); // Reset error

    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setMessage(
        "If your email is registered, password reset instructions will be sent."
      );
      setEmail(""); // Clear email input
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setError("Failed to send reset email. Please check your email address.");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-green-900">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-green-600">
            Enter your email to reset your password
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-green-300 placeholder-green-500 text-green-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Send Reset Instructions
            </button>
          </div>
        </form>
        {message && (
          <div className="mt-4 text-center text-sm text-green-600">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 text-center text-sm text-red-600">{error}</div>
        )}
      </div>
    </div>
  );
};
