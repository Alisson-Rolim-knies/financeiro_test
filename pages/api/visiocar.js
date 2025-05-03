import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    // Caminho para o arquivo visiocar.html no diretório public
    const filePath = path.join(process.cwd(), 'public', 'visiocar.html');
    
    // Verificar se o arquivo existe
    if (fs.existsSync(filePath)) {
      // Ler o conteúdo HTML
      const htmlContent = fs.readFileSync(filePath, 'utf8');
      
      // Definir o tipo de conteúdo como HTML
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      
      // Enviar o conteúdo HTML
      return res.status(200).send(htmlContent);
    } else {
      console.error(`Arquivo não encontrado: ${filePath}`);
      return res.status(404).json({ error: 'Arquivo visiocar.html não encontrado' });
    }
  } catch (error) {
    console.error(`Erro ao processar a solicitação: ${error.message}`);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}