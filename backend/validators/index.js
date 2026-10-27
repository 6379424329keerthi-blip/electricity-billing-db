/**
 * Request Validation Rules using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results and format error response
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    return res.status(422).json({
      success: false,
      message: 'Validation failed. Please verify input data.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  };
};

const loginRules = [
  body('email').isEmail().withMessage('A valid email address is required'),
  body('password').notEmpty().withMessage('Password cannot be empty'),
];

const consumerRules = [
  body('full_name').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('address').trim().isLength({ min: 5 }).withMessage('Address is required and must be at least 5 characters'),
  body('phone').trim().isLength({ min: 7, max: 20 }).withMessage('Valid phone number is required'),
  body('email').isEmail().withMessage('Valid email address is required'),
  body('consumer_category').isIn(['Residential', 'Commercial', 'Industrial']).withMessage('Category must be Residential, Commercial, or Industrial'),
];

const meterRules = [
  body('meter_number').trim().notEmpty().withMessage('Smart meter number is required'),
  body('consumer_id').isInt({ min: 1 }).withMessage('Valid consumer ID is required'),
  body('meter_type').optional().isString(),
  body('meter_status').optional().isIn(['ACTIVE', 'INACTIVE', 'MAINTENANCE']),
];

const readingRules = [
  body('meter_id').isInt({ min: 1 }).withMessage('Valid meter ID is required'),
  body('previous_reading').isFloat({ min: 0 }).withMessage('Previous reading must be non-negative'),
  body('current_reading').isFloat({ min: 0 }).withMessage('Current reading must be non-negative')
    .custom((value, { req }) => {
      if (parseFloat(value) < parseFloat(req.body.previous_reading)) {
        throw new Error('Current reading cannot be lower than the previous reading.');
      }
      return true;
    }),
  body('reading_date').isISO8601().withMessage('Valid reading date (YYYY-MM-DD) is required'),
  body('reading_type').optional().isIn(['Regular', 'Simulated', 'Estimated']),
];

const billGenerateRules = [
  body('reading_id').isInt({ min: 1 }).withMessage('Valid meter reading ID is required'),
  body('due_date').isISO8601().withMessage('Valid payment due date is required'),
];

const paymentRules = [
  body('bill_id').isInt({ min: 1 }).withMessage('Valid bill ID is required'),
  body('amount_paid').isFloat({ gt: 0 }).withMessage('Payment amount must be greater than zero'),
  body('payment_method').isIn(['Cash', 'UPI', 'Card', 'Bank Transfer']).withMessage('Valid payment method is required (Cash, UPI, Card, Bank Transfer)'),
];

const tariffRules = [
  body('consumer_category').isIn(['Residential', 'Commercial', 'Industrial']).withMessage('Category must be Residential, Commercial, or Industrial'),
  body('minimum_units').isFloat({ min: 0 }).withMessage('Minimum units must be non-negative'),
  body('maximum_units').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Maximum units must be non-negative if specified'),
  body('rate_per_unit').isFloat({ min: 0 }).withMessage('Rate per unit must be non-negative'),
  body('fixed_charge').optional().isFloat({ min: 0 }).withMessage('Fixed charge must be non-negative'),
  body('tax_percentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax percentage must be between 0 and 100'),
];

module.exports = {
  validate,
  loginRules,
  consumerRules,
  meterRules,
  readingRules,
  billGenerateRules,
  paymentRules,
  tariffRules,
};
