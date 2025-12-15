// api/track.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持 POST 请求' });
  }

  try {
    // 解析请求体
    const body = await req.json();
    const { event, testId, result } = body;

    // 验证必要参数
    if (!event || !testId) {
      return res.status(400).json({ error: '缺少必要参数: event 和 testId' });
    }

    // 限制 testId 长度和字符（安全）
    if (typeof testId !== 'string' || testId.length > 30 || !/^[a-zA-Z0-9_-]+$/.test(testId)) {
      return res.status(400).json({ error: 'testId 格式无效' });
    }

    const now = new Date().toISOString().split('T')[0]; // 格式: 2024-06-15

    if (event === 'view') {
      // 记录页面访问
      await kv.incr(`views:${testId}`);
      await kv.incr(`views:${testId}:${now}`);
      console.log(`[TRACK] 页面访问: ${testId}`);
    } 
    else if (event === 'complete') {
      // 记录测试完成
      await kv.incr(`completions:${testId}`);
      await kv.incr(`completions:${testId}:${now}`);
      
      // 如果提供了结果类型，也记录
      if (result && typeof result === 'string' && result.length <= 50) {
        await kv.incr(`results:${testId}:${result}`);
        console.log(`[TRACK] 测试完成: ${testId}, 结果: ${result}`);
      }
    } 
    else {
      return res.status(400).json({ error: '不支持的事件类型' });
    }

    // 成功响应
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('跟踪失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
}
