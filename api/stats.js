// api/stats.js
const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  try {
    // 测试 Redis
    await kv.ping();
    
    const stats = {};
    const tests = ['love', 'color', 'quiz', 'personality'];
    
    for (const test of tests) {
      const views = await kv.get(`${test}:views`) || 0;
      const completions = await kv.get(`${test}:completions`) || 0;
      const results = await kv.hgetall(`${test}:results`) || {};

      stats[test] = {
        views,
        completions,
        conversionRate: views > 0 ? `${Math.round((completions / views) * 100)}%` : '0%',
        results
      };
    }

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: '服务器内部错误' });
  }
};
