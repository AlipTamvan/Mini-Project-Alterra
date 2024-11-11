export const Link = ({ href, children, className }) => (
  <a
    href={href}
    className={`hover:text-secondary transition duration-300 ${className}`}
  >
    {children}
  </a>
);
