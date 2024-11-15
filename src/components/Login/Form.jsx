import React from "react";
import { Link } from "react-router-dom";
import InputField from "./InputField.jsx";
import GoogleLoginButton from "./GoogleLoginButton";

const Form = ({ formik, loginError, handleGoogleLogin }) => (
  <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-green-200">
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <InputField formik={formik} fieldName="email" label="Email address" />
        <InputField
          formik={formik}
          fieldName="password"
          label="Password"
          type="password"
        />

        <div className="mt-2 text-right">
          <Link
            to="/reset-password"
            className="text-sm font-medium text-green-600 hover:text-green-500"
          >
            Forgot Password?
          </Link>
        </div>

        {loginError && <div className="text-sm text-red-600">{loginError}</div>}

        <div>
          <button
            type="submit"
            data-testid="login-button" // Pastikan ini ada
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Sign in
          </button>
        </div>
      </form>

      <GoogleLoginButton handleGoogleLogin={handleGoogleLogin} />
    </div>
  </div>
);

export default Form;
