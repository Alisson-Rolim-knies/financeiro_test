/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Permitir que o Next.js sirva o arquivo HTML diretamente
  async rewrites() {
    return [
      {
        source: '/visiocar.html',
        destination: '/api/visiocar'
      },
      {
        source: '/app',
        destination: '/api/visiocar'
      },
      {
        source: '/app/status',
        destination: '/api/status'
      }
    ]
  }
}

module.exports = nextConfig