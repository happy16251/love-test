export const config = { runtime: 'nodejs' };

const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  try {
    await kv.ping();
    // ... 其他逻辑
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};
