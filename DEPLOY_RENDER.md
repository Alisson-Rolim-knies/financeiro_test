# Guia para Deploy do VisioCar na Render

Este guia explica como fazer o deploy do VisioCar na plataforma [Render](https://render.com), que oferece uma alternativa confiável à Vercel e pode ajudar a evitar problemas com cookies de terceiros.

## Pré-requisitos

1. Crie uma conta gratuita na [Render](https://render.com)
2. Tenha um repositório Git com seu código (GitHub, GitLab ou Bitbucket)
3. Tenha pronto o banco de dados PostgreSQL (você pode usar o próprio Render para isso)

## Passos para o Deploy

### 1. Configurar o Banco de Dados PostgreSQL (Opcional)

Se você precisar de um banco de dados:

1. No dashboard da Render, clique em "New +" e escolha "PostgreSQL"
2. Escolha um nome para o banco (ex: "visiocar-db")
3. Selecione a região mais próxima de você ou de seus usuários
4. Escolha o plano gratuito para testes ou plano pago para produção
5. Clique em "Create Database"
6. Anote a URL de conexão fornecida (você vai precisar dela depois)

### 2. Configurar o Web Service para o VisioCar

1. No dashboard da Render, clique em "New +" e selecione "Web Service"
2. Conecte seu repositório Git (GitHub, GitLab ou Bitbucket)
3. Configure as seguintes opções:
   - **Nome**: escolha um nome (ex: "visiocar")
   - **Região**: selecione a mesma região do banco de dados
   - **Branch**: geralmente "main" ou "master"
   - **Runtime**: "Node"
   - **Build Command**: `npm install`
   - **Start Command**: `./start-on-render.sh`

4. Na seção "Advanced", adicione as variáveis de ambiente:
   - `DATABASE_URL`: cole a URL de conexão do seu banco PostgreSQL
   - `NODE_ENV`: defina como "production"

5. Na seção "Auto-Deploy", deixe ativado para que o Render faça deploys automáticos

6. Clique em "Create Web Service"

### 3. Ajustes para o Render

Para garantir compatibilidade com o Render, vamos criar um arquivo específico:

```bash
# Crie o arquivo render.yaml na raiz do projeto
touch render.yaml
```

Adicione o seguinte conteúdo:

```yaml
services:
  - type: web
    name: visiocar
    env: node
    plan: free
    buildCommand: npm install
    startCommand: ./start-on-render.sh
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    headers:
      - path: /*
        name: Access-Control-Allow-Origin
        value: "*"
      - path: /*
        name: Access-Control-Allow-Headers
        value: "Content-Type, Authorization"
      - path: /*
        name: Access-Control-Allow-Methods
        value: "GET, POST, PUT, DELETE, OPTIONS"
```

Este arquivo já foi criado para você com o nome `render.yaml` na raiz do projeto.

### 4. Configurações Adicionais (Opcional)

Para projetos maiores, você pode querer configurar:

1. **Domínio Personalizado**:
   - No dashboard da Render, vá para seu web service
   - Clique na aba "Settings", depois em "Custom Domain"
   - Siga as instruções para configurar seu domínio

2. **Configuração de Ambiente**:
   - Para adicionar mais variáveis de ambiente, vá para a seção "Environment" nas configurações do seu web service

## Verificando o Deploy

1. Após o deploy (que pode levar alguns minutos), a Render fornecerá uma URL para acessar seu aplicativo (formato: `https://seu-app-nome.onrender.com`)
2. Acesse a URL para verificar se o VisioCar está funcionando corretamente
3. Teste todas as funcionalidades principais para garantir que tudo está operando como esperado

## Vantagens do Render sobre a Vercel

1. **Menos problemas com cookies e comunicação assíncrona**: O Render tem menos problemas com restrições de cookies de terceiros e comunicação entre worker threads
2. **Suporte nativo para Node.js**: Ambiente mais similar ao desenvolvimento local
3. **Opções gratuitas para banco de dados**: PostgreSQL gratuito (com limitações) diretamente na plataforma
4. **Simplicidade na configuração**: Deploy mais direto e menos configurações complexas

## Solução de Problemas

Se encontrar problemas com o deploy:

1. Verifique os logs de build e deploy no dashboard da Render
2. Certifique-se de que as variáveis de ambiente estão configuradas corretamente
3. Verifique se o banco de dados está acessível a partir do seu serviço

## Considerações sobre o Plano Gratuito

O plano gratuito do Render tem algumas limitações:
- Seu serviço será pausado após 15 minutos de inatividade
- Limite de 750 horas de uso por mês
- Performance reduzida comparada aos planos pagos

Para uso em produção, considere um dos planos pagos que oferecem melhor performance e disponibilidade contínua.