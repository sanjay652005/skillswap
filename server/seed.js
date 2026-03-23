/**
 * SkillSwap Seed Script
 * Run: node seed.js
 * Seeds: 6 users, exchanges, projects, messages, reviews, progress
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User             = require('./models/User');
const ExchangeRequest  = require('./models/ExchangeRequest');
const ExchangeWorkspace= require('./models/ExchangeWorkspace');
const Project          = require('./models/Project');
const Message          = require('./models/Message');
const Review           = require('./models/Review');
const Progress         = require('./models/Progress');
const Notification     = require('./models/Notification');
const Task             = require('./models/Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillswap';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), ExchangeRequest.deleteMany({}),
    ExchangeWorkspace.deleteMany({}), Project.deleteMany({}),
    Message.deleteMany({}), Review.deleteMany({}),
    Progress.deleteMany({}), Notification.deleteMany({}),
    Task.deleteMany({})
  ]);
  console.log('🧹 Cleared existing data');

  const hash = await bcrypt.hash('password123', 10);

  // ── USERS ──────────────────────────────────────────────────────
  const users = await User.insertMany([
    {
      name: 'Sanjay Patel', email: 'sanjay@demo.com', password: hash,
      skillsOffered: ['React', 'TypeScript', 'Node.js'],
      skillsWanted:  ['UI/UX Design', 'Figma'],
      bio: 'Full-stack dev passionate about clean code and great UX.',
      isOnline: true, level: 5, xp: 1240, badges: ['Early Adopter', 'Top Exchanger']
    },
    {
      name: 'Priya Sharma', email: 'priya@demo.com', password: hash,
      skillsOffered: ['UI/UX Design', 'Figma', 'Illustrator'],
      skillsWanted:  ['React', 'JavaScript'],
      bio: 'Designer who loves turning wireframes into beautiful products.',
      isOnline: true, level: 4, xp: 980, badges: ['Design Guru']
    },
    {
      name: 'Alex Chen', email: 'alex@demo.com', password: hash,
      skillsOffered: ['Python', 'Machine Learning', 'TensorFlow'],
      skillsWanted:  ['React', 'Node.js', 'MongoDB'],
      bio: 'ML engineer exploring the intersection of AI and web dev.',
      isOnline: false, level: 6, xp: 1580, badges: ['AI Pioneer', 'Top Exchanger']
    },
    {
      name: 'Maria Garcia', email: 'maria@demo.com', password: hash,
      skillsOffered: ['MongoDB', 'Express', 'DevOps', 'Docker'],
      skillsWanted:  ['Machine Learning', 'Python'],
      bio: 'Backend engineer obsessed with scalable systems.',
      isOnline: true, level: 3, xp: 620, badges: ['Backend Boss']
    },
    {
      name: 'Rahul Verma', email: 'rahul@demo.com', password: hash,
      skillsOffered: ['Flutter', 'Dart', 'Firebase'],
      skillsWanted:  ['UI/UX Design', 'Figma', 'Branding'],
      bio: 'Mobile dev building cross-platform apps that feel native.',
      isOnline: false, level: 4, xp: 870, badges: ['Mobile Maven']
    },
    {
      name: 'Emma Wilson', email: 'emma@demo.com', password: hash,
      skillsOffered: ['Content Writing', 'SEO', 'Copywriting'],
      skillsWanted:  ['WordPress', 'Web Development'],
      bio: 'Writer who makes tech approachable for everyone.',
      isOnline: true, level: 2, xp: 340, badges: ['Word Wizard']
    }
  ]);

  const [sanjay, priya, alex, maria, rahul, emma] = users;
  console.log('👥 Created 6 users');

  // ── EXCHANGE REQUESTS ──────────────────────────────────────────
  const exchanges = await ExchangeRequest.insertMany([
    {
      requester: sanjay._id, recipient: priya._id,
      offeredSkill: 'React', wantedSkill: 'UI/UX Design',
      message: 'Hey! I can teach you React hooks and state management in exchange for Figma design sessions.',
      status: 'active'
    },
    {
      requester: alex._id, recipient: sanjay._id,
      offeredSkill: 'Python', wantedSkill: 'Node.js',
      message: 'I want to learn backend with Node. Happy to teach ML basics.',
      status: 'active'
    },
    {
      requester: maria._id, recipient: alex._id,
      offeredSkill: 'MongoDB', wantedSkill: 'Machine Learning',
      message: 'Can teach you MongoDB aggregation pipeline if you help me with sklearn.',
      status: 'completed'
    },
    {
      requester: rahul._id, recipient: priya._id,
      offeredSkill: 'Flutter', wantedSkill: 'Figma',
      message: 'Would love to learn Figma for my app UI. Can teach Flutter in return.',
      status: 'pending'
    },
    {
      requester: emma._id, recipient: sanjay._id,
      offeredSkill: 'SEO', wantedSkill: 'React',
      message: 'I need to learn React for my portfolio. Can help with your content/SEO.',
      status: 'pending'
    }
  ]);
  console.log('🔄 Created 5 exchanges');

  // ── EXCHANGE WORKSPACES ────────────────────────────────────────
  const ws1 = await ExchangeWorkspace.create({
    exchange: exchanges[0]._id,
    participants: [sanjay._id, priya._id],
    sessionNotes: '## Session 1 Notes\n- Covered React useState and useEffect\n- Priya built her first component\n\n## Next Steps\n- Cover useContext\n- Priya to share Figma prototype',
    sharedCode: `import { useState, useEffect } from 'react';\n\nfunction UserCard({ userId }) {\n  const [user, setUser] = useState(null);\n\n  useEffect(() => {\n    fetch(\`/api/users/\${userId}\`)\n      .then(r => r.json())\n      .then(setUser);\n  }, [userId]);\n\n  if (!user) return <div>Loading...</div>;\n  return (\n    <div className="card">\n      <h2>{user.name}</h2>\n      <p>{user.bio}</p>\n    </div>\n  );\n}`,
    codeLanguage: 'javascript',
    progress: { requesterProgress: 60, recipientProgress: 45 }
  });

  const ws2 = await ExchangeWorkspace.create({
    exchange: exchanges[1]._id,
    participants: [alex._id, sanjay._id],
    sessionNotes: '## Python → Node.js Exchange\n- Alex showed pandas dataframes\n- Sanjay explained Express routing\n\n## Resources\n- Node.js docs: https://nodejs.org\n- Pandas cheatsheet shared',
    sharedCode: `const express = require('express');\nconst router  = express.Router();\n\n// GET all users\nrouter.get('/', async (req, res) => {\n  const users = await User.find().select('-password');\n  res.json(users);\n});\n\nmodule.exports = router;`,
    codeLanguage: 'javascript',
    progress: { requesterProgress: 30, recipientProgress: 50 }
  });
  console.log('🏠 Created 2 workspaces');

  // ── MESSAGES ───────────────────────────────────────────────────
  await Message.insertMany([
    // Workspace 1 chat
    { sender: sanjay._id, content: "Welcome Priya! Let's start with React basics today 🚀", roomId: String(ws1._id), roomType: 'exchange', messageType: 'text' },
    { sender: priya._id,  content: "So excited! I've been wanting to learn React for ages.", roomId: String(ws1._id), roomType: 'exchange', messageType: 'text' },
    { sender: sanjay._id, content: "Great! Here's our first component:", roomId: String(ws1._id), roomType: 'exchange', messageType: 'text' },
    { sender: sanjay._id, content: "const Hello = () => <h1>Hello World!</h1>;", roomId: String(ws1._id), roomType: 'exchange', messageType: 'code', codeLanguage: 'javascript' },
    { sender: priya._id,  content: "That's so clean! When do we get to Figma? 😄", roomId: String(ws1._id), roomType: 'exchange', messageType: 'text', isPinned: true, pinnedBy: sanjay._id, pinnedAt: new Date() },

    // DM between sanjay and priya
    { sender: priya._id,  content: "Hey Sanjay, can we reschedule tomorrow's session to 5pm?", roomId: [sanjay._id, priya._id].map(String).sort().join('_'), roomType: 'direct', messageType: 'text' },
    { sender: sanjay._id, content: "Sure! 5pm works perfectly. See you then 👍", roomId: [sanjay._id, priya._id].map(String).sort().join('_'), roomType: 'direct', messageType: 'text' },
    { sender: priya._id,  content: "Amazing, thanks!", roomId: [sanjay._id, priya._id].map(String).sort().join('_'), roomType: 'direct', messageType: 'text' },

    // DM between alex and sanjay
    { sender: alex._id,   content: "Sanjay your explanation of Express middleware was 🔥", roomId: [alex._id, sanjay._id].map(String).sort().join('_'), roomType: 'direct', messageType: 'text' },
    { sender: sanjay._id, content: "Thanks Alex! Your ML notebook was mind-blowing too", roomId: [alex._id, sanjay._id].map(String).sort().join('_'), roomType: 'direct', messageType: 'text' },
  ]);
  console.log('💬 Created messages');

  // ── PROJECTS ──────────────────────────────────────────────────
  const proj1 = await Project.create({
    title: 'SkillMatch AI — Smart Exchange Recommender',
    description: 'Building an AI-powered system that recommends the best skill exchange partners based on learning goals, skill compatibility, and past session ratings.',
    creator: alex._id,
    members: [{ user: alex._id, role: 'owner' }, { user: sanjay._id, role: 'member' }, { user: maria._id, role: 'member' }],
    skillsNeeded: ['React', 'Python', 'MongoDB', 'ML'],
    status: 'in-progress',
    tags: ['AI', 'Full Stack', 'Open Source']
  });

  const proj2 = await Project.create({
    title: 'DevPortfolio Builder',
    description: 'A drag-and-drop portfolio builder for developers. Pick templates, add your projects from GitHub, and publish in minutes.',
    creator: priya._id,
    members: [{ user: priya._id, role: 'owner' }, { user: rahul._id, role: 'member' }],
    skillsNeeded: ['UI/UX Design', 'Flutter', 'Firebase'],
    status: 'open',
    tags: ['Design', 'Mobile', 'Productivity']
  });

  const proj3 = await Project.create({
    title: 'OpenLearn — Free SkillSwap Platform',
    description: 'Open source alternative to paid learning platforms. Community teaches community. Skills exchanged, no money involved.',
    creator: emma._id,
    members: [{ user: emma._id, role: 'owner' }, { user: sanjay._id, role: 'member' }],
    skillsNeeded: ['React', 'Content Writing', 'SEO', 'DevOps'],
    status: 'in-progress',
    tags: ['Open Source', 'Education', 'Community']
  });
  console.log('📁 Created 3 projects');

  // Project workspaces
  const ProjectWorkspace = require('./models/ProjectWorkspace');
  await ProjectWorkspace.create({
    project: proj1._id,
    members: [alex._id, sanjay._id, maria._id],
    sessionNotes: '## Sprint 1\n- Set up MongoDB schema for user skills\n- Alex working on recommendation algorithm\n- Sanjay building frontend matching UI',
    sharedCode: `# Skill compatibility scorer\ndef score_match(user_a, user_b):\n    offered = set(user_a['skillsOffered'])\n    wanted  = set(user_b['skillsWanted'])\n    overlap = offered & wanted\n    return len(overlap) / max(len(wanted), 1) * 100`,
    codeLanguage: 'python'
  });

  // ── TASKS ─────────────────────────────────────────────────────
  await Task.insertMany([
    { title: 'Design recommendation UI wireframe', project: proj1._id, workspace: ws1._id, assignedTo: sanjay._id, createdBy: alex._id, status: 'in-progress', priority: 'high', dueDate: new Date(Date.now() + 3*24*60*60*1000) },
    { title: 'Train skill compatibility ML model', project: proj1._id, workspace: ws1._id, assignedTo: alex._id, createdBy: alex._id, status: 'in-progress', priority: 'high', dueDate: new Date(Date.now() + 5*24*60*60*1000) },
    { title: 'Set up MongoDB Atlas cluster', project: proj1._id, workspace: ws1._id, assignedTo: maria._id, createdBy: alex._id, status: 'done', priority: 'medium' },
    { title: 'Create Figma mockups for portfolio builder', project: proj2._id, workspace: ws1._id, assignedTo: priya._id, createdBy: priya._id, status: 'todo', priority: 'high', dueDate: new Date(Date.now() + 7*24*60*60*1000) },
    { title: 'Write Flutter navigation boilerplate', project: proj2._id, workspace: ws1._id, assignedTo: rahul._id, createdBy: priya._id, status: 'todo', priority: 'medium' },
  ]);
  console.log('✅ Created tasks');

  // ── REVIEWS ──────────────────────────────────────────────────
  await Review.insertMany([
    {
      reviewer: priya._id, reviewee: sanjay._id,
      exchange: exchanges[0]._id,
      rating: 5, comment: 'Sanjay is an incredible teacher! Explained React hooks so clearly. Super patient and thorough.',
      compliments: ['Great Teacher', 'Patient', 'Clear Communicator']
    },
    {
      reviewer: sanjay._id, reviewee: priya._id,
      exchange: exchanges[0]._id,
      rating: 5, comment: 'Priya\'s design eye is phenomenal. She gave me so much feedback on my UI. Highly recommend!',
      compliments: ['Creative', 'Detail Oriented', 'Professional']
    },
    {
      reviewer: alex._id, reviewee: maria._id,
      exchange: exchanges[2]._id,
      rating: 4, comment: 'Maria knows MongoDB inside-out. The aggregation pipeline session was worth it.',
      compliments: ['Expert Knowledge', 'Well Prepared']
    },
    {
      reviewer: maria._id, reviewee: alex._id,
      exchange: exchanges[2]._id,
      rating: 5, comment: 'Alex made ML feel accessible. His notebook explanations are crystal clear.',
      compliments: ['Great Teacher', 'Knowledgeable', 'Patient']
    }
  ]);

  // Update user ratings
  await User.findByIdAndUpdate(sanjay._id, { rating: 5.0, reviewCount: 1 });
  await User.findByIdAndUpdate(priya._id,  { rating: 5.0, reviewCount: 1 });
  await User.findByIdAndUpdate(alex._id,   { rating: 5.0, reviewCount: 1 });
  await User.findByIdAndUpdate(maria._id,  { rating: 4.0, reviewCount: 1 });
  console.log('⭐ Created reviews');

  // ── PROGRESS ─────────────────────────────────────────────────
  await Progress.insertMany([
    {
      user: sanjay._id,
      skillGoals: [
        { skill: 'UI/UX Design', targetLevel: 'intermediate', currentLevel: 'beginner', hoursSpent: 4, hoursTarget: 20, milestones: [{ title: 'Completed first Figma session', completed: true }] },
        { skill: 'Figma', targetLevel: 'intermediate', currentLevel: 'beginner', hoursSpent: 2, hoursTarget: 15 }
      ],
      totalExchanges: 2, totalHours: 6, streak: 5
    },
    {
      user: priya._id,
      skillGoals: [
        { skill: 'React', targetLevel: 'intermediate', currentLevel: 'beginner', hoursSpent: 6, hoursTarget: 25, milestones: [{ title: 'Built first component', completed: true }, { title: 'Learned useState', completed: true }] },
        { skill: 'JavaScript', targetLevel: 'advanced', currentLevel: 'intermediate', hoursSpent: 10, hoursTarget: 30 }
      ],
      totalExchanges: 2, totalHours: 8, streak: 7
    },
    {
      user: alex._id,
      skillGoals: [
        { skill: 'Node.js', targetLevel: 'advanced', currentLevel: 'intermediate', hoursSpent: 5, hoursTarget: 20 },
        { skill: 'React', targetLevel: 'intermediate', currentLevel: 'beginner', hoursSpent: 2, hoursTarget: 15 }
      ],
      totalExchanges: 2, totalHours: 10, streak: 12
    }
  ]);
  console.log('📈 Created progress records');

  // ── NOTIFICATIONS ────────────────────────────────────────────
  await Notification.insertMany([
    { recipient: sanjay._id, sender: emma._id,  type: 'exchange_request', title: 'New Exchange Request', body: 'Emma Wilson wants to exchange SEO skills for React lessons', link: '/exchanges', read: false },
    { recipient: sanjay._id, sender: priya._id, type: 'new_message',      title: 'Message from Priya',  body: 'Hey Sanjay, can we reschedule tomorrow\'s session?', link: `/messages/${priya._id}`, read: false },
    { recipient: priya._id,  sender: rahul._id, type: 'exchange_request', title: 'New Exchange Request', body: 'Rahul Verma wants to exchange Flutter for Figma sessions', link: '/exchanges', read: false },
    { recipient: alex._id,   sender: sanjay._id,type: 'new_message',      title: 'Message from Sanjay', body: 'Thanks Alex! Your ML notebook was mind-blowing', link: `/messages/${sanjay._id}`, read: true },
  ]);
  console.log('🔔 Created notifications');

  console.log('\n🎉 SEED COMPLETE!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Demo Accounts (password: password123)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  users.forEach(u => console.log(`  ${u.email.padEnd(25)} ${u.name}`));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nRun: node seed.js (from /server directory)\n');

  await mongoose.disconnect();
}

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
