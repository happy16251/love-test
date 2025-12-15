// api/stats.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    // 获取所有 keys（简化版，只读常用数据）
    const viewsLove = await kv.get('views:love') || 0;
    const completionsLove = await kv.get('completions:love') || 0;
    
    // 获取结果分布（示例：假设你的 love 测试有 3 种结果）
    const result1 = await kv.get('results:love:浪漫型') || 0;
    const result2 = await kv.get('results:love:理性型') || 0;
    const result3 = await kv.get('results:love:独立型') || 0;

    // 你可以根据实际结果类型修改上面的 key

    const stats = {
      love: {
        views: viewsLove,
        completions: completionsLove,
        conversionRate: completionsLove > 0 ? ((completionsLove / viewsLove) * 100).toFixed(1) + '%' : '0%',
        results: {
          '浪漫型': result1,
          '理性型': result2,
          '独立型': result3
        }
      }
      // 未来可以添加 color, quiz 等
    };

    res.status(200).json(stats);

  } catch (error) {
    console.error('获取统计失败:', error);
    res.status(500).json({ error: '无法加载统计数据' });
  }
}
