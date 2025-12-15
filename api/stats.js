// api/stats.js
// 强制使用 Node.js 运行时（必须！）
export const config = {
  runtime: 'nodejs',
};

const { kv } = require('@vercel/kv');

// ✅ 在这里添加你所有的测试 ID（未来新增测试只需加一行！）
const TEST_IDS = ['love', 'color', 'quiz', 'personality'];

// 根据测试 ID 返回其所有可能的结果类型
function getResultTypesForTest(testId) {
  switch (testId) {
    case 'love':
      return ['温柔忍者', '小心机', '直白表达', '情绪敏感'];
    
    case 'color':
      return ['红色型', '蓝色型', '绿色型', '黄色型'];
    
    case 'quiz':
      return ['A型', 'B型', 'C型', 'D型'];
    
    case 'personality':
      return ['外向型', '内向型', '思考型', '情感型'];
    
    default:
      return [];
  }
}

module.exports = async function handler(req, res) {
  try {
    const stats = {};

    for (const testId of TEST_IDS) {
      // 获取访问量和完成量
      const views = (await kv.get(`views:${testId}`)) || 0;
      const completions = (await kv.get(`completions:${testId}`)) || 0;

      // 计算转化率
      const conversionRate = views > 0 ? ((completions / views) * 100).toFixed(1) + '%' : '0%';

      // 获取结果分布
      const resultTypes = getResultTypesForTest(testId);
      const results = {};
      for (const type of resultTypes) {
        const count = (await kv.get(`results:${testId}:${type}`)) || 0;
        if (count > 0) {
          results[type] = count;
        }
      }

      stats[testId] = {
        views,
        completions,
        conversionRate,
        results
      };
    }

    res.status(200).json(stats);

  } catch (error) {
    console.error('Stats error:', error.message || error);
    res.status(500).json({ error: '统计接口出错' });
  }
};
