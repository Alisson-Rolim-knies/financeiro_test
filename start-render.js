#!/usr/bin/env node

/**
 * Script de inicialização para o VisioCar no Render
 * Detecta o ambiente e inicia o servidor adequadamente
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Definir porta
const PORT = process.env.PORT || 10000;

// Verificar se estamos no Render
const isRender = process.env.RENDER === 'true';

console.log(`Iniciando VisioCar ${isRender ? 'no Render' : 'localmente'}`);
console.log(`Usando porta: ${PORT}`);

// Garantir que a pasta public exista
if (!fs.existsSync('public')) {
  console.log('Criando pasta public...');
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

// Iniciar o servidor Express
function startExpressServer() {
  console.log('Iniciando servidor Express...');
  
  // Modificar variáveis de ambiente para o express
  process.env.PORT = PORT;
  
  // Escolher o servidor certo para iniciar
  const serverPath = fs.existsSync('server/simple.ts') 
    ? 'server/simple.ts' 
    : 'server/index.ts';
  
  console.log(`Usando servidor: ${serverPath}`);
  
  const serverProcess = spawn('node', [serverPath], {
    env: { ...process.env, PORT: PORT.toString() },
    stdio: 'inherit'
  });
  
  serverProcess.on('close', (code) => {
    console.log(`Servidor encerrado com código ${code}`);
    process.exit(code);
  });
  
  return serverProcess;
}

// Executar
console.log('Preparando ambiente...');
copyFilesToPublic();
startExpressServer();