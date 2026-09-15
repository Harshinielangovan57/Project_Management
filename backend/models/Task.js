const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  taskName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Task name is required' },
      len: { args: [1, 200], msg: 'Task name must be between 1 and 200 characters' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Medium',
    allowNull: false,
    validate: {
      isIn: {
        args: [['Low', 'Medium', 'High']],
        msg: 'Priority must be Low, Medium, or High'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Completed'),
    defaultValue: 'Pending',
    allowNull: false,
    validate: {
      isIn: {
        args: [['Pending', 'In Progress', 'Completed']],
        msg: 'Status must be Pending, In Progress, or Completed'
      }
    }
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'tasks',
  timestamps: true
});

module.exports = Task;
