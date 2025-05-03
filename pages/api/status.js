// Esta é uma rota da API que o Next.js irá servir
export default function handler(req, res) {
  res.status(200).json({
    status: 'online',
    message: 'API VisioCar funcionando! (Vercel via Next.js)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
}