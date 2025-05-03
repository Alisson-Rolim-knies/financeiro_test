#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Garantir que a pasta 'public' exista
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Copiar arquivos da pasta attached_assets para public
function copyFilesToPublic() {
  if (fs.existsSync('attached_assets')) {
    try {
      const files = fs.readdirSync('attached_assets');
      files.forEach(file => {
        const sourcePath = path.join('attached_assets', file);
        const destPath = path.join('public', file);
        // Ignorar pastas para simplificar
        if (fs.statSync(sourcePath).isFile()) {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`Copiado: ${sourcePath} -> ${destPath}`);
        }
      });
    } catch (error) {
      console.error('Erro ao copiar arquivos:', error);
    }
  }
}

// Criar arquivo next.config.js se não existir
function createNextConfig() {
  const configPath = 'next.config.js';
  if (!fs.existsSync(configPath)) {
    const configContent = `/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ]
  }
}`;
    fs.writeFileSync(configPath, configContent);
    console.log('Arquivo next.config.js criado');
  }
}

// Iniciar o servidor Next.js
function startNextServer() {
  console.log('Iniciando servidor Next.js...');
  
  const nextProcess = spawn('npx', ['next', 'dev', '-p', '3000']);
  
  nextProcess.stdout.on('data', (data) => {
    console.log(`${data}`);
  });
  
  nextProcess.stderr.on('data', (data) => {
    console.error(`${data}`);
  });
  
  nextProcess.on('close', (code) => {
    console.log(`Servidor Next.js encerrado com código ${code}`);
  });
  
  return nextProcess;
}

// Capturar SIGINT para fechamento limpo
process.on('SIGINT', () => {
  console.log('\nEncerrando servidor Next.js...');
  process.exit();
});

// Executar
console.log('Preparando ambiente para Next.js...');
copyFilesToPublic();
createNextConfig();
startNextServer();