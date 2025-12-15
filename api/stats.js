// api/stats.js
import { kv } from '@vercel/kv';

// ✅ 在这里定义你所有的测试 ID（未来新增测试只需加一行！）
const TEST_IDS = ['love', 'color', 'quiz', 'personality'];

export default async function handler(req, res) {
  try {
    const stats = {};

    for (const testId of TEST_IDS) {
      // 获取总访问量和完成量
      const views = (await kv.get(`views:${testId}`)) || 0;
      const completions = (await kv.get(`completions:${testId}`)) || 0;

      // 计算转化率
      const conversionRate = views > 0 ? ((completions / views) * 100).toFixed(1) + '%' : '0%';

      // 🔍 自动获取该测试的所有结果类型
      // 注意：@vercel/kv 不支持 keys(*)，所以我们用约定前缀 + 手动列出常见结果（或换方案）
      // 但 Upstash Redis REST API 支持 scan，而 @vercel/kv 抽象层不暴露 scan。
      // 因此我们采用“预设常见结果 + 动态 fallback”策略。

      // ✅ 方案：为每个测试预设可能的结果类型（你可以按需扩展）
      const resultTypes = getResultTypesForTest(testId);
      const results = {};

      for (const type of resultTypes) {
        const count = (await kv.get(`results:${testId}:${type}`)) || 0;
        if (count > 0) {
          results[type] = count;
        }
      }

      // 🟡 可选：如果你希望完全动态（需使用 Upstash REST API 直接调用），可跳过此限制
      // 当前方案已足够实用，且性能好。

      stats[testId] = {
        views,
        completions,
        conversionRate,
        results
      };
    }

    res.status(200).json(stats);

  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
}

// ✅ 根据测试 ID 返回其可能的结果类型（你在这里管理每个测试的结果）
function getResultTypesForTest(testId) {
  switch (testId) {
    case 'love':
      return ['温柔忍者', '小心机', '直白表达', '情绪敏感'];
    
    case 'color':
      // 示例：你可以替换成你 color 测试的真实结果
      return ['红色型', '蓝色型', '绿色型', '黄色型'];
    
    case 'quiz':
      return ['A型', 'B型', 'C型', 'D型'];
    
    case 'personality':
      return ['外向型', '内向型', '思考型', '情感型'];
    
    default:
      // 默认返回空数组（不会统计未知测试的结果）
      return [];
  }
}
