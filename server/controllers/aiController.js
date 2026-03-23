const Groq = require('groq-sdk');

const getGroq = () => {
const key = process.env.GROQ_API_KEY;
  return new Groq({ apiKey: key });
};

const groqChat = async (messages) => {
  const groq = getGroq();
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages,
    max_tokens: 1000,
    temperature: 0.7
  });
  return completion.choices[0].message.content;
};

const FALLBACK_SUGGESTIONS = `Based on your profile:
1. **Connect strategically** - Look for developers who complement your skill set.
2. **Start small** - Begin with a focused exchange: 2-3 sessions to build trust.
3. **Document everything** - Use the workspace tasks and notes to track progress.`;

exports.chat = async (req, res) => {
  try {
    const { messages, context } = req.body;
    const systemPrompt = `You are an expert AI assistant for a Developer Skill Exchange Platform called SkillSwap. You help developers with coding questions, learning paths, code review, career advice, and project architecture.
Context about the user: ${context || 'A developer using the SkillSwap platform'}
Be concise, practical, and use code examples when helpful. Format code with proper markdown.`;

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const text = await groqChat(groqMessages);
    res.json({ message: text });
  } catch (error) {
    console.error('GROQ CHAT ERROR:', error.message);
    res.json({ message: `AI Error: ${error.message}` });
  }
};

exports.reviewCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code?.trim()) return res.status(400).json({ error: 'Code is required' });

    const prompt = `You are an expert code reviewer. Review the following ${language || 'code'} and respond ONLY with valid JSON (no markdown, no backticks).

Code to review:
\`\`\`${language || ''}
${code}
\`\`\`

Return this exact JSON structure:
{
  "summary": "2-3 sentence overall assessment",
  "score": <number 1-10>,
  "issues": [
    {
      "type": "bug|suggestion|style|performance|security",
      "severity": "error|warning|info",
      "line": <line number or null>,
      "message": "specific issue description"
    }
  ],
  "positives": ["what the code does well"],
  "refactored": "improved version of the code if meaningful changes exist, otherwise null"
}
Be specific, actionable, and constructive. Max 6 issues.`;

    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.3
    });

    const text = completion.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    try {
      res.json(JSON.parse(clean));
    } catch {
      res.status(500).json({ error: 'Failed to parse AI response' });
    }
  } catch (error) {
    console.error('reviewCode error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const { skillsOffered = [], skillsWanted = [] } = req.user;
    const prompt = `A developer offers: ${skillsOffered.join(', ') || 'none yet'} and wants to learn: ${skillsWanted.join(', ') || 'none yet'}.
Provide 3 concise actionable suggestions to maximize their skill exchange experience. Keep each under 2 sentences.`;

    const text = await groqChat([{ role: 'user', content: prompt }]);
    res.json({ suggestions: text });
  } catch (error) {
    res.json({ suggestions: FALLBACK_SUGGESTIONS });
  }
};

exports.getLearningPath = async (req, res) => {
  try {
    const { currentSkills, goalSkill, level, timeframe } = req.body;

    const prompt = `You are an expert developer educator. Create a detailed structured learning path in JSON format.

A developer wants to learn: "${goalSkill}"
Their current skills: ${currentSkills?.join(', ') || 'beginner'}
Their experience level: ${level}
Available time: ${timeframe}

Return ONLY valid JSON (no markdown, no backticks, no extra text) in this exact structure:
{
  "goal": "${goalSkill}",
  "level": "${level}",
  "timeframe": "${timeframe}",
  "summary": "2 sentence overview of the path",
  "phases": [
    {
      "phase": 1,
      "title": "Phase name",
      "duration": "X weeks",
      "topics": ["topic1", "topic2", "topic3", "topic4"],
      "resources": [
        { "type": "video|docs|course|article|book", "title": "Resource name", "url": "https://..." }
      ],
      "project": "Hands-on project to build"
    }
  ],
  "exchangeTip": "Specific tip for finding exchange partners on SkillSwap for this goal"
}
Include 3-4 phases. For each phase include 3-5 resources with variety: YouTube videos, official docs, articles from Medium/dev.to/tutorials, books. Do NOT suggest any paid courses like Udemy, Coursera, DataCamp, Pluralsight. For YouTube links always use search URL format: https://www.youtube.com/results?search_query=TOPIC+tutorial (never use direct video URLs like watch?v=). Use real working URLs for all other resources. Be specific and practical.`;

    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7
    });

    const text = completion.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    try {
      res.json(JSON.parse(clean));
    } catch {
      res.status(500).json({ error: 'Failed to parse AI response' });
    }
  } catch (error) {
    console.error('Learning path error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
