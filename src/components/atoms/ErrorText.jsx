export const ErrorText = ({ children, show }) => (
  <p className={`text-red-500 text-sm ${show ? "" : "hidden"}`}>{children}</p>
);
