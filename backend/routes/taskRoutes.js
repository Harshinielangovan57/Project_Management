const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const { taskCreateValidation, taskUpdateValidation } = require('../middleware/validator');

// All task routes require authentication
router.use(auth);

router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskCreateValidation, taskController.createTask);
router.put('/:id', taskUpdateValidation, taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
