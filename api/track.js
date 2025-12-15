// api/track.js
const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' });
  }

  try {
    // ✅ 使用 req.body，而不是 req.json()
    let body;
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }

    const { event, testId, result } = body;

    if (!event || !testId) {
      return res.status(400).json({ error: '缺少必要参数: event 和 testId' });
    }

    if (typeof testId !== 'string' || testId.length > 30 || !/^[a-zA-Z0-9_-]+$/.test(testId)) {
      return res.status(400).json({ error: 'testId 格式无效' });
    }

    const now = new Date().toISOString().split('T')[0];

    if (event === 'view') {
      await kv.incr(`views:${testId}`);
      await kv.incr(`views:${testId}:${now}`);
    } else if (event === 'complete') {
      await kv.incr(`completions:${testId}`);
      await kv.incr(`completions:${testId}:${now}`);
      if (result && typeof result === 'string' && result.length <= 50) {
        await kv.incr(`results:${testId}:${result}`);
      }
    } else {
      return res.status(400).json({ error: '不支持的事件类型' });
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Track error:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};
