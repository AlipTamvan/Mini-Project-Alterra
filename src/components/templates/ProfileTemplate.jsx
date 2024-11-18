import { useRef, useEffect, useState } from "react";
import { UserCircle, Leaf } from "lucide-react";
import { userApi } from "../../services/userService";
import cloudinaryService from "../../services/cloudinaryService";
import useUserStore from "../../stores/userStore";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { isEqual } from "lodash";
import {
  getAuth,
  updatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .required("Last name is required"),
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores"
    )
    .required("Username is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  avatar: Yup.string(),
  avatarPublicId: Yup.string(),
  scores: Yup.number(),
});

export const ProfileTemplate = () => {
  const { user: storeUser } = useUserStore();
  const fileInputRef = useRef(null);

  const initialValues = {
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    scores: 0,
    avatar: "",
    avatarPublicId: "",
  };

  const [originalValues, setOriginalValues] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [tempFile, setTempFile] = useState(null);

  useEffect(() => {
    if (storeUser) {
      const userData = {
        firstName: storeUser.firstName || "",
        lastName: storeUser.lastName || "",
        username: storeUser.username || "",
        email: storeUser.email || "",
        password: storeUser.password || "",
        scores: storeUser.scores || 0,
        avatar: storeUser.avatar || "",
        avatarPublicId: storeUser.avatarPublicId || "",
      };
      setOriginalValues(userData);

      if (storeUser.avatar) {
        setPreviewUrl(storeUser.avatar);
      }
    }
  }, [storeUser]);

  const handleAvatarChange = async (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const tempPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(tempPreviewUrl);
        setIsImageChanged(true);
        setTempFile(file);
        setFieldValue("avatar", "pending");
      } catch (error) {
        console.error("Error handling image:", error);
        alert("Failed to handle image");
      }
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!isImageChanged && isEqual(values, originalValues)) return;

    try {
      setLoading(true);

      let updatedValues = { ...values };
      const auth = getAuth();
      const user = auth.currentUser;

      // Cek perubahan
      const isEmailChanged = values.email !== originalValues.email;
      const isPasswordChanged = values.password !== originalValues.password;
      const isInitialPassword = !originalValues.password && values.password;

      // Handle perubahan email
      if (isEmailChanged) {
        try {
          // Cek apakah email sudah terdaftar
          const isRegistered = await userApi.isEmailRegistered(values.email);
          if (isRegistered) {
            // Jika email sudah terdaftar, tampilkan pesan error
            await Swal.fire({
              icon: "error",
              title: "Email Already Registered",
              html: `
          <div style="text-align: left; font-family: Arial, sans-serif; color: #333;">
            <p style="font-size: 1rem; margin-bottom: 1rem;">
              The email <strong style="color: #10B981;">${values.email}</strong> is already registered. Please use a different email.
            </p>
          </div>
        `,
              confirmButtonColor: "#10B981",
              confirmButtonText: "Got it",
              showCancelButton: false,
              allowOutsideClick: false,
            });
            return; // Hentikan proses jika email sudah terdaftar
          }

          // Update email di Firebase Auth
          await verifyBeforeUpdateEmail(user, values.email);

          // Update email di Firestore
          await userApi.updateUser(storeUser.userId, {
            ...updatedValues,
            email: values.email,
          });

          // Update state global
          useUserStore.getState().setUser({
            ...storeUser,
            email: values.email,
          });

          await Swal.fire({
            icon: "success",
            title: "Email Successfully Changed",
            html: `
              <div style="text-align: left; font-family: Arial, sans-serif; color: #333;">
                <p style="font-size: 1rem; margin-bottom: 1rem;">
                  Your new email: <strong style="color: #10B981;">${values.email}</strong>
                </p>
                <p style="font-size: 1rem; margin-bottom: 0.5rem;">Please follow the steps below:</p>
                <ol style="padding-left: 1.5rem; font-size: 0.9rem; line-height: 1.6;">
                  <li>1. Check your new email for verification.</li>
                  <li>2. Click the verification link in the email.</li>
                  <li>3. Log in again using your new email.</li>
                </ol>
              </div>
            `,
            confirmButtonColor: "#10B981",
            confirmButtonText: "Got it",
            showCancelButton: false,
            allowOutsideClick: false,
          });

          // Logout dan redirect hanya untuk perubahan email
          await auth.signOut();
          window.location.href = "/login";
          return;
        } catch (error) {
          console.error("Error while changing email:", error);
          throw new Error(
            "Failed to change email: Please try logging in again. " +
              error.message
          );
        }
      }

      // Handle perubahan password atau password pertama kali
      if (isPasswordChanged || isInitialPassword) {
        try {
          // Update password di Firebase Auth
          await updatePassword(user, values.password);
        } catch (error) {
          console.error("Error updating password:", error);
          throw new Error("Failed to update password: " + error.message);
        }
      }

      // Handle perubahan gambar dan data lainnya
      if (isImageChanged && tempFile) {
        const { url, publicId } = await cloudinaryService.uploadImage(
          tempFile,
          originalValues.avatarPublicId
        );
        updatedValues.avatar = url;
        updatedValues.avatarPublicId = publicId;
      }

      // Update profil di Firestore (jika ada perubahan selain email)
      if (!isEmailChanged) {
        await userApi.updateUser(storeUser.userId, updatedValues);

        // Update state
        const updatedUserData = {
          ...storeUser,
          ...updatedValues,
        };

        useUserStore.getState().setUser(updatedUserData);
        setOriginalValues(updatedUserData);
        setPreviewUrl(updatedValues.avatar);
        setIsImageChanged(false);
        setTempFile(null);

        await Swal.fire({
          icon: "success",
          title: "Successfully Updated",
          text: "Your profile has been successfully updated!",
          confirmButtonColor: "#10B981",
          background: "#ECFDF5",
          iconColor: "#059669",
        });
      }
    } catch (error) {
      console.error("Error memperbarui profil:", error);
      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Please log in again",
        confirmButtonColor: "#EF4444",
      }).then(() => {
        window.location.href = "/login";
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-green-600 text-white">
          <h2 className="text-lg leading-6 font-medium flex items-center">
            <Leaf className="mr-2" /> Update Eco Profile
          </h2>
        </div>
        <div className="border-t border-gray-200">
          <Formik
            initialValues={originalValues || initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting, setFieldValue, values }) => (
              <Form className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="User avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-green-500"
                      />
                    ) : (
                      <UserCircle className="w-32 h-32 text-green-500" />
                    )}
                    <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2">
                      <Leaf className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleAvatarChange(e, setFieldValue)}
                    className="hidden"
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
                    disabled={loading}
                  >
                    {loading ? "Uploading..." : "Upload Photo"}
                  </button>
                </div>

                <div className="mb-4 flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <Field
                      name="firstName"
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                        errors.firstName && touched.firstName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.firstName && touched.firstName && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.firstName}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <Field
                      name="lastName"
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                        errors.lastName && touched.lastName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.lastName && touched.lastName && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.lastName}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <Field
                    name="username"
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                      errors.username && touched.username
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.username && touched.username && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.username}
                    </div>
                  )}
                </div>

                <div className="mb-4 flex items-center">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Field
                      name="email"
                      type="email"
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                        errors.email && touched.email
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.email && touched.email && (
                      <div className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Field
                    name="password"
                    type="password"
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                      errors.password && touched.password
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.password && touched.password && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Eco Score
                  </label>
                  <div className="mt-1 text-3xl font-bold text-green-600 flex items-center">
                    {values.scores} <Leaf className="ml-2 w-6 h-6" />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Score cannot be modified directly
                  </p>
                </div>

                <div>
                  <button
                    type="submit"
                    className={`w-full text-white py-2 px-4 rounded transition duration-200 flex items-center justify-center ${
                      !isEqual(values, originalValues) && !isSubmitting
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={isEqual(values, originalValues) || isSubmitting}
                  >
                    <Leaf className="mr-2" />
                    {isSubmitting ? "Saving..." : "Update Profile"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ProfileTemplate;
