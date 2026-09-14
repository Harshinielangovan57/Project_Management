const { Op } = require('sequelize');
const { Task, Project } = require('../models');

// GET /api/tasks
// Query params: ?projectId=xxx&search=xxx&status=Pending&priority=High&sortBy=createdAt&order=DESC
const getTasks = async (req, res, next) => {
  try {
    const { projectId, search, status, priority, sortBy = 'createdAt', order = 'DESC' } = req.query;

    const whereClause = {
      userId: req.user.id
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (status && ['Pending', 'In Progress', 'Completed'].includes(status)) {
      whereClause.status = status;
    }

    if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
      whereClause.priority = priority;
    }

    if (search && search.trim() !== '') {
      whereClause.taskName = {
        [Op.like]: `%${search.trim()}%`
      };
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status']
        }
      ],
      order: [[sortBy, order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      where: {
        id,
        userId: req.user.id
      },
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status']
        }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to view it.'
      });
    }

    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { taskName, description, priority, status, dueDate, projectId } = req.body;

    // Verify project exists and belongs to this user
    const project = await Project.findOne({
      where: {
        id: projectId,
        userId: req.user.id
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Invalid project ID or you do not own this project.'
      });
    }

    const task = await Task.create({
      taskName,
      description,
      priority: priority || 'Medium',
      status: status || 'Pending',
      dueDate: dueDate || null,
      projectId,
      userId: req.user.id
    });

    const createdTask = await Task.findByPk(task.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: createdTask
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { taskName, description, priority, status, dueDate, projectId } = req.body;

    const task = await Task.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to modify it.'
      });
    }

    // If changing projectId, verify ownership of the new project
    if (projectId && projectId !== task.projectId) {
      const project = await Project.findOne({
        where: {
          id: projectId,
          userId: req.user.id
        }
      });
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'The target project does not exist or does not belong to you.'
        });
      }
      task.projectId = projectId;
    }

    if (taskName !== undefined) task.taskName = taskName;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to delete it.'
      });
    }

    await task.destroy();

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
