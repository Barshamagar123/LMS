const Button = ({ children, ...props }) => (
  <button
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
    {...props}
  >
    {children}
  </button>
);

export default Button;
