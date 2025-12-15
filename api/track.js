// api/track.js
// 强制使用 Node.js 运行时（必须！）
export const config = {
  runtime: 'nodejs',
};

const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' });
  }

  try {
    // 正确解析请求体（Vercel Edge/Node 兼容）
    let body;
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }

    const { event, testId, result } = body;

    // 参数校验
    if (!event || !testId) {
      return res.status(400).json({ error: '缺少必要参数: event 和 testId' });
    }

    if (typeof testId !== 'string' || testId.length > 30 || !/^[a-zA-Z0-9_-]+$/.test(testId)) {
      return res.status(400).json({ error: 'testId 格式无效（只允许字母、数字、下划线、短横线）' });
    }

    const now = new Date().toISOString().split('T')[0];

    if (event === 'view') {
      // 记录访问量
      await kv.incr(`views:${testId}`);
      await kv.incr(`views:${testId}:${now}`);
    } else if (event === 'complete') {
      // 记录完成量
      await kv.incr(`completions:${testId}`);
      await kv.incr(`completions:${testId}:${now}`);
      // 记录具体结果（如“温柔忍者”）
      if (result && typeof result === 'string' && result.length <= 50) {
        await kv.incr(`results:${testId}:${result}`);
      }
    } else {
      return res.status(400).json({ error: '不支持的事件类型（仅支持 view / complete）' });
    }

    // 成功响应
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Track error:', error.message || error);
    res.status(500).json({ error: '服务器内部错误，请稍后再试' });
  }
};
