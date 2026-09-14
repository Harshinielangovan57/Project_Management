const { sequelize } = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');

// Relationships
// User <-> Project (1:N)
User.hasMany(Project, {
  foreignKey: 'userId',
  as: 'projects',
  onDelete: 'CASCADE'
});
Project.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Project <-> Task (1:N)
Project.hasMany(Task, {
  foreignKey: 'projectId',
  as: 'tasks',
  onDelete: 'CASCADE'
});
Task.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project'
});

// User <-> Task (1:N) for direct user ownership
User.hasMany(Task, {
  foreignKey: 'userId',
  as: 'tasks',
  onDelete: 'CASCADE'
});
Task.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  sequelize,
  User,
  Project,
  Task
};
