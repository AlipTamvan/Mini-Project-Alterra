export const Label = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="block text-gray-700 text-sm mb-2 font-roboto font-normal leading-6"
  >
    {children}
  </label>
);
