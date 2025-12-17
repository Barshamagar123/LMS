import { body, validationResult } from "express-validator";

// Validation for enrolling in a course
export const freeEnrollRules = [
  body("courseId")
    .isInt({ min: 1 })
    .withMessage("Valid courseId is required"),
];

// Validation for paid enrollment if needed later
export const paidEnrollRules = [
  body("courseId").isInt(),
  body("paymentMethod")
    .isString()
    .isIn(["CARD", "PAYPAL", "RAZORPAY"])
    .withMessage("Invalid payment method"),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
