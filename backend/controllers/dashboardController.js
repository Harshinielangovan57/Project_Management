const { Project, Task } = require('../models');

// GET /api/dashboard/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch projects count & status breakdown
    const totalProjects = await Project.count({ where: { userId } });
    const inProgressProjects = await Project.count({
      where: { userId, status: 'In Progress' }
    });
    const completedProjects = await Project.count({
      where: { userId, status: 'Completed' }
    });
    const notStartedProjects = await Project.count({
      where: { userId, status: 'Not Started' }
    });

    // Fetch tasks count & status breakdown
    const totalTasks = await Task.count({ where: { userId } });
    const completedTasks = await Task.count({
      where: { userId, status: 'Completed' }
    });
    const inProgressTasks = await Task.count({
      where: { userId, status: 'In Progress' }
    });
    const pendingTasks = await Task.count({
      where: { userId, status: 'Pending' }
    });

    // Priority breakdown
    const highPriorityTasks = await Task.count({
      where: { userId, priority: 'High' }
    });
    const mediumPriorityTasks = await Task.count({
      where: { userId, priority: 'Medium' }
    });
    const lowPriorityTasks = await Task.count({
      where: { userId, priority: 'Low' }
    });

    // Overall completion percentage
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const projectCompletionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

    // Recent 5 projects
    const recentProjects = await Project.findAll({
      where: { userId },
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: Task, as: 'tasks', attributes: ['id', 'status'] }]
    });

    // Recent 5 tasks
    const recentTasks = await Task.findAll({
      where: { userId },
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }]
    });

    return res.status(200).json({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressProjects,
        notStartedProjects,
        completedProjects,
        inProgressTasks,
        highPriorityTasks,
        mediumPriorityTasks,
        lowPriorityTasks,
        taskCompletionRate,
        projectCompletionRate,
        recentProjects,
        recentTasks
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
