const { Op } = require('sequelize');
const { Project, Task } = require('../models');

// GET /api/projects
// Query params: ?search=keyword&status=In%20Progress&sortBy=createdAt&order=DESC
const getProjects = async (req, res, next) => {
  try {
    const { search, status, sortBy = 'createdAt', order = 'DESC' } = req.query;
    const whereClause = {
      userId: req.user.id
    };

    if (status && ['Not Started', 'In Progress', 'Completed'].includes(status)) {
      whereClause.status = status;
    }

    if (search && search.trim() !== '') {
      whereClause.name = {
        [Op.like]: `%${search.trim()}%`
      };
    }

    const projects = await Project.findAll({
      where: whereClause,
      include: [
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'status', 'priority']
        }
      ],
      order: [[sortBy, order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']]
    });

    // Augment with task statistics (totalTasks, completedTasks, progressPercent)
    const formattedProjects = projects.map(p => {
      const proj = p.toJSON();
      const totalTasks = proj.tasks ? proj.tasks.length : 0;
      const completedTasks = proj.tasks ? proj.tasks.filter(t => t.status === 'Completed').length : 0;
      const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      return {
        ...proj,
        totalTasks,
        completedTasks,
        progressPercent
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedProjects.length,
      data: formattedProjects
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      where: {
        id,
        userId: req.user.id
      },
      include: [
        {
          model: Task,
          as: 'tasks',
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to view it.'
      });
    }

    const proj = project.toJSON();
    const totalTasks = proj.tasks ? proj.tasks.length : 0;
    const completedTasks = proj.tasks ? proj.tasks.filter(t => t.status === 'Completed').length : 0;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        ...proj,
        totalTasks,
        completedTasks,
        progressPercent
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, description, status, startDate, endDate } = req.body;

    const project = await Project.create({
      name,
      description,
      status: status || 'Not Started',
      startDate: startDate || null,
      endDate: endDate || null,
      userId: req.user.id
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, startDate, endDate } = req.body;

    const project = await Project.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to modify it.'
      });
    }

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (startDate !== undefined) project.startDate = startDate || null;
    if (endDate !== undefined) project.endDate = endDate || null;

    await project.save();

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have permission to delete it.'
      });
    }

    await project.destroy();

    return res.status(200).json({
      success: true,
      message: 'Project and associated tasks deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
