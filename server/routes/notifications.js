const router = require('express').Router();
const { getNotifications, markRead, markAllRead, deleteNotification } = require('../controllers/notificationsController');
const auth = require('../middleware/auth');

router.get('/',              auth, getNotifications);
router.put('/read-all',      auth, markAllRead);
router.put('/:id/read',      auth, markRead);
router.delete('/:id',        auth, deleteNotification);

module.exports = router;
