// Middleware para lidar com erros de comunicação assíncrona na Vercel

export default function middleware(req) {
  // Configurar cabeçalhos de CORS para todas as requisições
  const headers = new Headers(req.headers);
  
  // Tempos de cache ajustados para evitar problemas de comunicação
  headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Tempo limite de resposta aumentado
  headers.set('Connection', 'keep-alive');
  headers.set('Keep-Alive', 'timeout=30');
  
  // Se for uma requisição OPTIONS, responder imediatamente
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers, status: 204 });
  }
  
  // Para outras requisições, passar os cabeçalhos modificados
  return new Response(null, { 
    status: 200,
    headers: {
      'x-middleware-next': '1',
      ...Object.fromEntries(headers.entries())
    }
  });
}