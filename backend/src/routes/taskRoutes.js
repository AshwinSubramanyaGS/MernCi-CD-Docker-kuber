const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { taskValidation } = require('../utils/validationSchema');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(taskValidation, validateRequest, createTask);

router.route('/:id')
  .get(getTask)
  .put(taskValidation, validateRequest, updateTask)
  .delete(deleteTask);

router.patch('/:id', updateTaskStatus);

module.exports = router;