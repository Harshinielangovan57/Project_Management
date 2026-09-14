const { body, query, param, validationResult } = require('express-validator');

// Middleware to check validation results and return clean error responses
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation rules for Auth
const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be 2 to 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validate
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

// Validation rules for Projects
const projectCreateValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 1, max: 200 }).withMessage('Project name must not exceed 200 characters'),
  body('description')
    .optional({ nullable: true })
    .trim(),
  body('status')
    .optional()
    .isIn(['Not Started', 'In Progress', 'Completed']).withMessage('Status must be Not Started, In Progress, or Completed'),
  body('startDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().toDate().withMessage('Start date must be a valid date (YYYY-MM-DD)'),
  body('endDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().toDate().withMessage('End date must be a valid date (YYYY-MM-DD)'),
  validate
];

const projectUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Project name cannot be empty')
    .isLength({ min: 1, max: 200 }).withMessage('Project name must not exceed 200 characters'),
  body('description')
    .optional({ nullable: true })
    .trim(),
  body('status')
    .optional()
    .isIn(['Not Started', 'In Progress', 'Completed']).withMessage('Status must be Not Started, In Progress, or Completed'),
  body('startDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().toDate().withMessage('Start date must be a valid date (YYYY-MM-DD)'),
  body('endDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().toDate().withMessage('End date must be a valid date (YYYY-MM-DD)'),
  validate
];

// Validation rules for Tasks
const taskCreateValidation = [
  body('taskName')
    .trim()
    .notEmpty().withMessage('Task name is required')
    .isLength({ min: 1, max: 200 }).withMessage('Task name must not exceed 200 characters'),
  body('projectId')
    .notEmpty().withMessage('Project ID is required')
    .isUUID().withMessage('Project ID must be a valid UUID'),
  body('description')
    .optional({ nullable: true })
    .trim(),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed']).withMessage('Status must be Pending, In Progress, or Completed'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().toDate().withMessage('Due date must be a valid date (YYYY-MM-DD)'),
  validate
];

const taskUpdateValidation = [
  body('taskName')
    .optional()
    .trim()
    .notEmpty().withMessage('Task name cannot be empty')
    .isLength({ min: 1, max: 200 }).withMessage('Task name must not exceed 200 characters'),
  body('description')
    .optional({ nullable: true })
    .trim(),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed']).withMessage('Status must be Pending, In Progress, or Completed'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().toDate().withMessage('Due date must be a valid date (YYYY-MM-DD)'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  projectCreateValidation,
  projectUpdateValidation,
  taskCreateValidation,
  taskUpdateValidation
};
