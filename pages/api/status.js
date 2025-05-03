export default function handler(req, res) {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    framework: 'Next.js'
  })
}