const router = require('express').Router();
const {
  getMessages, sendMessage,
  getConversations, getDMHistory, sendDM, getDMUser,
  pinMessage, unpinMessage, getPinnedMessages,
  deleteMessage, clearConversation
} = require('../controllers/messagesController');
const auth = require('../middleware/auth');

router.get('/conversations',        auth, getConversations);
router.get('/dm/:userId',           auth, getDMHistory);
router.get('/dm-user/:userId',      auth, getDMUser);
router.post('/dm',                  auth, sendDM);
router.get('/pinned/:roomId',       auth, getPinnedMessages);
router.delete('/clear/:userId',     auth, clearConversation);   // must be before /:id
router.put('/:id/pin',              auth, pinMessage);
router.put('/:id/unpin',            auth, unpinMessage);
router.delete('/:id',               auth, deleteMessage);
router.get('/:roomType/:roomId',    auth, getMessages);
router.post('/',                    auth, sendMessage);

module.exports = router;
