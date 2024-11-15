import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
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
);

export default Footer;
