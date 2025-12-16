// api/track.js
const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { test, event, result } = req.body;

    if (!test || !event) {
      return res.status(400).json({ error: 'Missing test or event' });
    }

    const validTests = ['love', 'color', 'quiz', 'personality'];
    if (!validTests.includes(test)) {
      return res.status(400).json({ error: 'Invalid test name' });
    }

    // 记录访问量
    if (event === 'view') {
      await kv.incr(`${test}:views`);
    }
    // 记录完成量 + 结果
    else if (event === 'complete' && result) {
      await kv.incr(`${test}:completions`);
      await kv.hincrby(`${test}:results`, result, 1);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Track error:', error.message);
    res.status(500).json({ error: 'Failed to track' });
  }
};
