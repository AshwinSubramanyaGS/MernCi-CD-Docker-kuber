const { body } = require('express-validator');
const { TASK_STATUS, TASK_PRIORITY } = require('../config/constants');

// Auth validations
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Task validations
const taskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('status')
    .optional()
    .isIn(Object.values(TASK_STATUS))
    .withMessage('Invalid status value'),
  
  body('priority')
    .optional()
    .isIn(Object.values(TASK_PRIORITY))
    .withMessage('Invalid priority value'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    })
];

module.exports = {
  registerValidation,
  loginValidation,
  taskValidation
};