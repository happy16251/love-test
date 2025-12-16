// api/stats.js
export const config = { runtime: 'nodejs' };

const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  console.log('🔍 URL:', process.env.UPSTASH_REDIS_REST_URL);
  console.log('🔍 Token length:', process.env.UPSTASH_REDIS_REST_TOKEN?.length);

  try {
    await kv.ping();
    console.log('🎉 Redis connected!');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('💥 Error:', error.message);
    res.status(500).json({ error: '服务器内部错误' });
  }
};
