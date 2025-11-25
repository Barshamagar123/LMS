const InputField = ({ label, type = "text", ...props }) => (
  <div className="flex flex-col mb-4">
    <label className="mb-2 text-gray-700">{label}</label>
    <input
      type={type}
      className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  </div>
);

export default InputField;
