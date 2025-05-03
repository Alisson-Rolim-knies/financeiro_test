import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para visiocar.html após 2 segundos
    const redirectTimer = setTimeout(() => {
      router.push('/visiocar.html');
    }, 2000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-2">
      <Head>
        <title>VisioCar - Sistema de Inspeção Veicular</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="VisioCar - Sistema de Inspeção Veicular" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-3xl font-bold mb-4">VisioCar</h1>
          <p className="text-gray-600 mb-6">Redirecionando para o sistema de inspeção veicular...</p>
          
          <div className="mb-6">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          
          <p className="text-gray-500 mb-4">Se não for redirecionado automaticamente, clique no botão abaixo:</p>
          <a
            href="/visiocar.html"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Acessar o Sistema
          </a>
        </div>
      </main>
    </div>
  );
}