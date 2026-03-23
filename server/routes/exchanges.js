const router = require('express').Router();
const { sendRequest, getMyExchanges, respondToRequest, getWorkspace, addResource, completeExchange, cancelRequest, getWorkspaceStats } = require('../controllers/exchangesController');
const auth = require('../middleware/auth');

router.post('/', auth, sendRequest);
router.get('/', auth, getMyExchanges);
router.put('/:id/respond',   auth, respondToRequest);
router.put('/:id/complete',  auth, completeExchange);
router.put('/:id/cancel',    auth, cancelRequest);
router.get('/workspace/:id', auth, getWorkspace);
router.get('/workspace/:id/stats', auth, getWorkspaceStats);
router.post('/workspace/:id/resources', auth, addResource);

module.exports = router;
