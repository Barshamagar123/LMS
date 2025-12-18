import { body, param, validationResult } from 'express-validator';

// Existing validation rules
export const processPaymentValidation = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isInt()
    .withMessage('Course ID must be a number'),
  
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['CARD', 'ESEWA', 'KHALTI', 'COD'])
    .withMessage('Invalid payment method'),
  
  body('paymentDetails')
    .optional()
    .isObject()
    .withMessage('Payment details must be an object')
];

export const createPaymentIntentValidation = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isInt()
    .withMessage('Course ID must be a number'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 1 })
    .withMessage('Amount must be a positive number')
];

export const refundPaymentValidation = [
  param('paymentId')
    .notEmpty()
    .withMessage('Payment ID is required')
    .isInt()
    .withMessage('Payment ID must be a number'),
  
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

// Add this validate function
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
  
  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    errors: extractedErrors
  });
};