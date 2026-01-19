const Task = require('../models/Task');
const { TASK_STATUS, TASK_PRIORITY } = require('../config/constants');

// @desc    Get all tasks for current user
// @route   GET /api/v1/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, priority, search, sortBy, sortOrder = 'desc' } = req.query;
    const userId = req.user.id;

    // Build query
    const query = { userId };

    // Apply filters
    if (status && Object.values(TASK_STATUS).includes(status)) {
      query.status = status;
    }

    if (priority && Object.values(TASK_PRIORITY).includes(priority)) {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by newest
    }

    // Execute query
    const tasks = await Task.find(query).sort(sort);
    const count = tasks.length;

    res.json({
      success: true,
      data: tasks,
      meta: {
        count,
        total: count
      },
      message: 'Tasks retrieved successfully'
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error retrieving tasks'
      }
    });
  }
};

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    res.json({
      success: true,
      data: task,
      message: 'Task retrieved successfully'
    });
  } catch (error) {
    console.error('Get task error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error retrieving task'
      }
    });
  }
};

// @desc    Create task
// @route   POST /api/v1/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    
    const task = await Task.create({
      title,
      description,
      status: status || TASK_STATUS.PENDING,
      priority: priority || TASK_PRIORITY.MEDIUM,
      dueDate,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error creating task'
      }
    });
  }
};

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    
    let task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    task.title = title;
    task.description = description;
    task.status = status;
    task.priority = priority;
    task.dueDate = dueDate;

    await task.save();

    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Update task error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error updating task'
      }
    });
  }
};

// @desc    Update task status
// @route   PATCH /api/v1/tasks/:id
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id
      },
      { status },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    res.json({
      success: true,
      data: task,
      message: 'Task status updated successfully'
    });
  } catch (error) {
    console.error('Update task status error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error updating task status'
      }
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    res.json({
      success: true,
      data: {},
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Error deleting task'
      }
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};