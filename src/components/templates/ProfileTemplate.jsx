import React, { useRef, useEffect, useState } from "react";
import { UserCircle, Leaf } from "lucide-react";
import { userApi } from "../../services/userService";
import cloudinaryService from "../../services/cloudinaryService";
import useUserStore from "../../stores/userStore";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { isEqual } from "lodash";

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
        // Create temporary preview
        const tempPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(tempPreviewUrl);
        setIsImageChanged(true);
        setTempFile(file);

        // We don't upload to Cloudinary immediately - we'll do that on form submit
        setFieldValue("avatar", "pending"); // Temporary value
      } catch (error) {
        console.error("Error handling image:", error);
        alert("Failed to handle image");
        handleCancelImageChange(setFieldValue);
      }
    }
  };

  const handleCancelImageChange = (setFieldValue) => {
    if (previewUrl && previewUrl !== originalValues.avatar) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(originalValues.avatar);
    setFieldValue("avatar", originalValues.avatar);
    setFieldValue("avatarPublicId", originalValues.avatarPublicId);
    setIsImageChanged(false);
    setTempFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!isImageChanged && isEqual(values, originalValues)) return;

    try {
      setLoading(true);

      let updatedValues = { ...values };

      // Handle image upload if changed
      if (isImageChanged && tempFile) {
        try {
          const { url, publicId } = await cloudinaryService.uploadImage(
            tempFile,
            originalValues.avatarPublicId // This will handle deletion of old image
          );
          updatedValues.avatar = url;
          updatedValues.avatarPublicId = publicId;
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("Failed to upload image");
          return;
        }
      }

      // Update user profile
      const response = await userApi.updateUser(
        storeUser.userId,
        updatedValues
      );
      useUserStore.getState().setUser(response);

      // Update state
      setOriginalValues(updatedValues);
      setPreviewUrl(updatedValues.avatar);
      setIsImageChanged(false);
      setTempFile(null);

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
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

                {/* Rest of the form fields remain the same */}
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

                <div className="mb-4">
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