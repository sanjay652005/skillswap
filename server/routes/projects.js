const router = require('express').Router();
const {
  createProject, getAllProjects, getMyProjects, getProjectById,
  inviteCollaborator, respondToInvite,
  requestToJoin, respondToJoinRequest,
  completeProject,
  getWorkspace, updateLiveCode
} = require('../controllers/projectsController');
const auth = require('../middleware/auth');

router.post('/', auth, createProject);
router.get('/', auth, getAllProjects);
router.get('/my', auth, getMyProjects);
router.get('/workspace/:id', auth, getWorkspace);
router.put('/workspace/:id/code', auth, updateLiveCode);
router.get('/:id', auth, getProjectById);
router.post('/:id/invite', auth, inviteCollaborator);
router.put('/:id/invite/respond', auth, respondToInvite);
router.post('/:id/join-request', auth, requestToJoin);
router.put('/:id/join-request/respond', auth, respondToJoinRequest);
router.put('/:id/complete', auth, completeProject);

module.exports = router;
