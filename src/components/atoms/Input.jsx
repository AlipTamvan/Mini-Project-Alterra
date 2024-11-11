export const Input = ({ error, ...props }) => (
  <input
    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none ${
      error ? "border-red-500" : ""
    }`}
    {...props}
  />
);
