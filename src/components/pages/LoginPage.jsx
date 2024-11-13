import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { userApi } from "../../services/userService";
import useUserStore from "../../stores/userStore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { firebaseAuth } from "../../config/firebase.config"; // Pastikan ini ada
import { getDoc, doc, setDoc } from "firebase/firestore"; // Tambahkan ini
import { firestore } from "../../config/firebase.config"; // Pastikan Anda mengimpor firestore

export const LoginPage = () => {
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useUserStore();

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  const handleLogin = async (values) => {
    try {
      const user = await userApi.loginUser(values.email, values.password);

      // Ambil data pengguna dari Firestore
      const userDoc = await getDoc(doc(firestore, "users", user.id));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({ ...userData, userId: user.id });
      }

      // Jika login berhasil, set user dan status autentikasi
      setIsAuthenticated(true);

      Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: "Selamat Datang!",
        confirmButtonColor: "#10B981",
        background: "#ECFDF5",
        iconColor: "#059669",
      }).then(() => {
        navigate("/");
      });
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        setLoginError("Incorrect Username or Password");
      } else {
        setLoginError(error.message || "Terjadi kesalahan saat login.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;

      // Cek apakah pengguna sudah ada di Firestore
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (!userDoc.exists()) {
        // Jika pengguna belum ada, simpan data pengguna ke Firestore
        await setDoc(doc(firestore, "users", user.uid), {
          email: user.email,
          firstName: "",
          lastName: "",
          username: "Guest" + Math.floor(1000 + Math.random() * 9000),
          scores: 0,
          avatar: "",
          avatarPublicId: "",
          userId: user.uid,
        });
      } else {
        // Jika pengguna sudah ada, perbarui data jika perlu
        await setDoc(
          doc(firestore, "users", user.uid),
          {
            email: user.email,
            userId: user.uid,
          },
          { merge: true }
        ); // Menggunakan merge untuk memperbarui data
      }

      // Ambil data pengguna dari Firestore
      const updatedUserDoc = await getDoc(doc(firestore, "users", user.uid));
      if (updatedUserDoc.exists()) {
        const userData = updatedUserDoc.data();
        setUser({ ...userData, userId: user.uid });
      }

      // Jika login berhasil, set user dan status autentikasi
      setIsAuthenticated(true);

      Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: "Selamat Datang!",
        confirmButtonColor: "#10B981",
        background: "#ECFDF5",
        iconColor: "#059669",
      }).then(() => {
        navigate("/");
      });
    } catch (error) {
      setLoginError(
        error.message || "Terjadi kesalahan saat login dengan Google."
      );
    }
  };
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: handleLogin,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-green-800">
          Sign in to EcoQuiz
        </h2>
        <p className="mt-2 text-center text-sm text-green-600">
          Learn and contribute to a greener future
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-green-200">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-green-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    formik.errors.email && formik.touched.email
                      ? "border-red-300"
                      : "border-green-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <div className="mt-2 text-sm text-red-600">
                  {formik.errors.email}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-green-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${
                    formik.errors.password && formik.touched.password
                      ? "border-red-300"
                      : "border-green-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="mt-2 text-sm text-red-600">
                  {formik.errors.password}
                </div>
              )}
            </div>

            <div className="mt-2 text-right">
              <Link
                to="/reset-password" // Update to your reset password route
                className="text-sm font-medium text-green-600 hover:text-green-500"
              >
                Forgot Password?
              </Link>
            </div>

            {loginError && (
              <div className="text-sm text-red-600">{loginError}</div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-green-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-green-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div>
                <button
                  onClick={handleGoogleLogin}
                  className="w-full inline-flex justify-center py-2 px-4 border border-green-300 rounded-md shadow-sm bg-white text-sm font-medium text-green-500 hover:bg-green-50"
                >
                  <span className="sr-only">Sign in with Google</span>
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-green-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-green-600 hover:text-green-500"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
