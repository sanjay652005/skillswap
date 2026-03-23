const Project = require('../models/Project');
const ProjectWorkspace = require('../models/ProjectWorkspace');
const { createNotification } = require('./notificationsController');

let _io = null;
exports.setIo = (io) => { _io = io; };

const populateAll = 'owner collaborators.user workspace invites.user joinRequests.user';

// Safely ensure arrays exist on old documents
const fixArrays = async (project) => {
  let changed = false;
  if (!project.joinRequests) { project.joinRequests = []; changed = true; }
  if (!project.invites) { project.invites = []; changed = true; }
  if (!project.collaborators) { project.collaborators = []; changed = true; }
  if (changed) await project.save();
  return project;
};

exports.createProject = async (req, res) => {
  try {
    const { title, description, techStack, skillsNeeded, githubRepo, isPublic } = req.body;
    const project = new Project({
      title, description, techStack, skillsNeeded, githubRepo, isPublic,
      owner: req.user._id,
      collaborators: [{ user: req.user._id, role: 'admin' }],
      invites: [],
      joinRequests: []
    });
    await project.save();
    const workspace = new ProjectWorkspace({
      project: project._id,
      liveCode: { content: `// ${title}\n// Start coding here...\n` }
    });
    await workspace.save();
    project.workspace = workspace._id;
    await project.save();
    await project.populate(populateAll);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const { tech, status, search } = req.query;
    let query = { isPublic: true };
    if (tech) query.techStack = { $in: [new RegExp(tech, 'i')] };
    if (status) query.status = status;
    if (search) query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];
    const projects = await Project.find(query).populate(populateAll).sort('-createdAt').limit(50);
    // Normalize any old docs missing arrays
    const safe = projects.map(p => {
      const obj = p.toObject();
      obj.joinRequests = obj.joinRequests || [];
      obj.invites = obj.invites || [];
      obj.collaborators = obj.collaborators || [];
      return obj;
    });
    res.json(safe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'collaborators.user': req.user._id }]
    }).populate(populateAll).sort('-createdAt');
    const safe = projects.map(p => {
      const obj = p.toObject();
      obj.joinRequests = obj.joinRequests || [];
      obj.invites = obj.invites || [];
      obj.collaborators = obj.collaborators || [];
      return obj;
    });
    res.json(safe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(populateAll);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const obj = project.toObject();
    obj.joinRequests = obj.joinRequests || [];
    obj.invites = obj.invites || [];
    obj.collaborators = obj.collaborators || [];
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.inviteCollaborator = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Only owner can invite' });
    await fixArrays(project);
    const alreadyMember = project.collaborators.some(c => c.user.toString() === userId);
    if (alreadyMember) return res.status(400).json({ error: 'Already a collaborator' });
    const alreadyInvited = project.invites.some(i => i.user.toString() === userId && i.status === 'pending');
    if (alreadyInvited) return res.status(400).json({ error: 'Already invited' });
    project.invites.push({ user: userId });
    await project.save();
    await project.populate(populateAll);

    await createNotification(_io, {
      recipient: userId,
      sender: req.user._id,
      type: 'project_invite',
      title: 'Project Invitation 🎉',
      body: `${req.user.name} invited you to join "${project.title}"`,
      link: '/projects'
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.respondToInvite = async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    await fixArrays(project);
    const invite = project.invites.find(i => i.user.toString() === req.user._id.toString() && i.status === 'pending');
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    invite.status = status;
    if (status === 'accepted') {
      project.collaborators.push({ user: req.user._id, role: 'contributor' });
      await createNotification(_io, {
        recipient: project.owner,
        sender: req.user._id,
        type: 'join_accepted',
        title: 'Invite Accepted! 🎉',
        body: `${req.user.name} accepted your invitation to "${project.title}"`,
        link: '/projects'
      });
    }
    await project.save();
    await project.populate(populateAll);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.requestToJoin = async (req, res) => {
  try {
    const { message } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    await fixArrays(project);
    const alreadyMember = project.collaborators.some(c => c.user.toString() === req.user._id.toString());
    if (alreadyMember) return res.status(400).json({ error: 'Already a member' });
    const alreadyRequested = project.joinRequests.some(r => r.user.toString() === req.user._id.toString() && r.status === 'pending');
    if (alreadyRequested) return res.status(400).json({ error: 'Already requested to join' });
    project.joinRequests.push({ user: req.user._id, message: message || '' });
    await project.save();
    await project.populate(populateAll);

    await createNotification(_io, {
      recipient: project.owner,
      sender: req.user._id,
      type: 'join_request',
      title: 'New Join Request',
      body: `${req.user.name} wants to join "${project.title}"`,
      link: '/projects'
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.respondToJoinRequest = async (req, res) => {
  try {
    const { requestUserId, status } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Only owner can manage requests' });
    await fixArrays(project);
    const request = project.joinRequests.find(r => r.user.toString() === requestUserId && r.status === 'pending');
    if (!request) return res.status(404).json({ error: 'Request not found' });
    request.status = status;
    if (status === 'accepted') {
      project.collaborators.push({ user: requestUserId, role: 'contributor' });
      await createNotification(_io, {
        recipient: requestUserId,
        sender: req.user._id,
        type: 'join_accepted',
        title: 'Join Request Accepted! 🎉',
        body: `${req.user.name} accepted your request to join "${project.title}"`,
        link: '/projects'
      });
    } else {
      await createNotification(_io, {
        recipient: requestUserId,
        sender: req.user._id,
        type: 'join_declined',
        title: 'Join Request Declined',
        body: `Your request to join "${project.title}" was declined`,
        link: '/projects'
      });
    }
    await project.save();
    await project.populate(populateAll);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getWorkspace = async (req, res) => {
  try {
    const workspace = await ProjectWorkspace.findById(req.params.id).populate('project');
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLiveCode = async (req, res) => {
  try {
    const { content, language } = req.body;
    const workspace = await ProjectWorkspace.findByIdAndUpdate(
      req.params.id,
      { liveCode: { content, language, lastEditedBy: req.user._id, lastEditedAt: new Date() } },
      { new: true }
    );
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Only owner can complete project' });
    project.status = 'completed';
    await project.save();
    await project.populate(populateAll);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
