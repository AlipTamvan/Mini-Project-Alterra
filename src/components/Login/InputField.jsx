import React from "react";

const InputField = ({ formik, fieldName, label, type = "text" }) => (
  <div>
    <label
      htmlFor={fieldName}
      className="block text-sm font-medium text-green-700"
    >
      {label}
    </label>
    <div className="mt-1">
      <input
        id={fieldName}
        name={fieldName}
        type={type}
        autoComplete={type === "password" ? "current-password" : "email"}
        required
        className={`appearance-none block w-full px-3 py-2 border ${
          formik.errors[fieldName] && formik.touched[fieldName]
            ? "border-red-300"
            : "border-green-300"
        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values[fieldName]}
      />
    </div>
    {formik.touched[fieldName] && formik.errors[fieldName] && (
      <div className="mt-2 text-sm text-red-600">
        {formik.errors[fieldName]}
      </div>
    )}
  </div>
);

export default InputField;
