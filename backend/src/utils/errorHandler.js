export const errorHandler = (res, error) => {
  console.error(error);
  return res.status(500).json({ message: "Internal Server Error", error: error.message });
};
