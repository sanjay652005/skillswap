const router = require('express').Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/tasksController');
const auth = require('../middleware/auth');

router.get('/:workspaceId', auth, getTasks);
router.post('/', auth, createTask);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;
