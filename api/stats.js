// api/stats.js
export const config = { runtime: 'nodejs' };

const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  try {
    // 测试 Redis 是否可连接
    await kv.ping();
    
    // 如果能到这里，说明 Redis 连接成功
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
    // 🔥 关键：把真实错误返回给前端（仅调试用！）
    console.error('💥 真实错误:', error.message || error);
    res.status(500).json({ 
      error: '服务器内部错误',
      debug: error.message || '未知错误'
    });
  }
};
