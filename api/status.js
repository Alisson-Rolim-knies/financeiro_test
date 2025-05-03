// API handler para status na Vercel
export default function handler(req, res) {
  res.json({
    status: 'online',
    message: 'API VisioCar funcionando! (Vercel)',
    timestamp: new Date().toISOString(),
    environment: 'Vercel Serverless'
  });
}