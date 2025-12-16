// api/stats.js
const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  try {
    const tests = ['love', 'color', 'quiz', 'personality'];
    const stats = {};

    for (const test of tests) {
      const views = Number(await kv.get(`${test}:views`) || 0);
      const completions = Number(await kv.get(`${test}:completions`) || 0);
      const results = await kv.hgetall(`${test}:results`) || {};

      // 转换结果为数字
      const numericResults = {};
      for (const [key, value] of Object.entries(results)) {
        numericResults[key] = Number(value);
      }

      stats[test] = {
        views,
        completions,
        conversionRate: views > 0 ? Math.round((completions / views) * 100) : 0,
        results: numericResults
      };
    }

    res.setHeader('Cache-Control', 'no-cache');
    res.status(200).json(stats);
  } catch (error) {
    console.error('Stats error:', error.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
