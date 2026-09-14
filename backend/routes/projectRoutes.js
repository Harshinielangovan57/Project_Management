const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');
const { projectCreateValidation, projectUpdateValidation } = require('../middleware/validator');

// All project routes require authentication
router.use(auth);

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectCreateValidation, projectController.createProject);
router.put('/:id', projectUpdateValidation, projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
