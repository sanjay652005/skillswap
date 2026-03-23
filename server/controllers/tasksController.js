const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ workspaceId: req.params.workspaceId })
      .populate('assignedTo createdBy', 'name avatar')
      .sort('createdAt');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, workspaceId, workspaceType, assignedTo, priority, dueDate } = req.body;
    const task = new Task({
      title, description, workspaceId, workspaceType,
      assignedTo, priority, dueDate,
      createdBy: req.user._id
    });
    await task.save();
    await task.populate('assignedTo createdBy', 'name avatar');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.status === 'done') updates.completedAt = new Date();

    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('assignedTo createdBy', 'name avatar');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
