const router = require('express').Router();
const c = require('../controllers/progressController');
const auth = require('../middleware/auth');

router.get('/my',                                    auth, c.getMyProgress);
router.get('/:exchangeId',                           auth, c.getProgress);
router.put('/:exchangeId',                           auth, c.updateProgress);
router.post('/:exchangeId/goals',                    auth, c.addGoal);
router.put('/:exchangeId/goals/:goalId/toggle',      auth, c.toggleGoal);
router.delete('/:exchangeId/goals/:goalId',          auth, c.deleteGoal);
router.post('/:exchangeId/milestones',               auth, c.addMilestone);
router.put('/:exchangeId/milestones/:milestoneId/toggle', auth, c.toggleMilestone);
router.delete('/:exchangeId/milestones/:milestoneId', auth, c.deleteMilestone);

module.exports = router;
