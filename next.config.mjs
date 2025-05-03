/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurar o Vercel para não expor arquivos TypeScript
  pageExtensions: ['js', 'jsx'],
  
  // Configuração para ambiente estático com redirecionamentos
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
      {
        source: '/:path*',
        destination: '/attached_assets/index.html',
      },
    ];
  },
};

export default nextConfig;