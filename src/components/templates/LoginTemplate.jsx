import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { userApi } from "../../services/userService";
import useUserStore from "../../stores/userStore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { firebaseAuth } from "../../config/firebase.config";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { firestore } from "../../config/firebase.config";
import Header from "../Login/Header";
import Form from "../Login/Form";
import Footer from "../Login/Footer";

const LoginTemplate = () => {
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
      const userDoc = await getDoc(doc(firestore, "users", user.id));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({ ...userData, userId: user.id });
      }
      setIsAuthenticated(true);
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome!",
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
        setLoginError(error.message || "An error occurred during login.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;

      // Check if the user document exists in Firestore
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      const firestoreEmail = userDoc.exists() ? userDoc.data().email : null;

      // Update Firestore if the email in Firebase Auth differs from Firestore's email
      if (!userDoc.exists() || firestoreEmail !== user.email) {
        await setDoc(
          doc(firestore, "users", user.uid),
          {
            email: user.email, // Sync the email from Firebase Auth
            firstName: "",
            lastName: "",
            username: userDoc.exists()
              ? userDoc.data().username // Keep existing username if it exists
              : "Guest" + Math.floor(1000 + Math.random() * 9000),
            scores: userDoc.exists() ? userDoc.data().scores : 0,
            avatar: userDoc.exists() ? userDoc.data().avatar : "",
            avatarPublicId: userDoc.exists()
              ? userDoc.data().avatarPublicId
              : "",
            userId: user.uid,
          },
          { merge: true }
        );
      }

      // Retrieve updated user data
      const updatedUserDoc = await getDoc(doc(firestore, "users", user.uid));
      if (updatedUserDoc.exists()) {
        const userData = updatedUserDoc.data();
        setUser({ ...userData, userId: user.uid });
      }

      setIsAuthenticated(true);
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome!",
        confirmButtonColor: "#10B981",
        background: "#ECFDF5",
        iconColor: "#059669",
      }).then(() => {
        navigate("/");
      });
    } catch (error) {
      setLoginError(
        error.message || "An error occurred while logging in with Google."
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
      <Header />
      <Form
        formik={formik}
        loginError={loginError}
        handleGoogleLogin={handleGoogleLogin}
      />
      <Footer />
    </div>
  );
};

export default LoginTemplate;
