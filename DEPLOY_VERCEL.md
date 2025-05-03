# Guia para Deploy do VisioCar na Vercel

Este guia explica como realizar o deploy do VisioCar na plataforma Vercel.

## Pré-requisitos

1. Uma conta na [Vercel](https://vercel.com)
2. Git instalado em sua máquina
3. [Vercel CLI](https://vercel.com/cli) (opcional, mas recomendado)

## Passos para o deploy

### 1. Preparar o código para deploy (já feito)

Os arquivos necessários já foram criados:
- `vercel.json` - Configuração da Vercel
- `/api/*.js` - Funções serverless para a API
- `.env.example` - Exemplo de variáveis de ambiente

### 2. Subir o código para um repositório Git

```bash
# Se ainda não tiver um repositório Git, inicialize um
git init

# Adicione todos os arquivos
git add .

# Faça um commit das alterações
git commit -m "Preparação para deploy na Vercel"

# Adicione um repositório remoto (substitua URL_DO_SEU_REPOSITORIO pela URL real)
git remote add origin URL_DO_SEU_REPOSITORIO

# Envie o código para o repositório
git push -u origin main  # ou master, dependendo da sua branch padrão
```

### 3. Deploy na Vercel via Dashboard

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Importe seu repositório Git
4. Configure as variáveis de ambiente:
   - `DATABASE_URL` - URL completa do seu banco PostgreSQL 
   - `NODE_ENV` - Defina como `production`
5. Clique em "Deploy"

### 4. Deploy via Vercel CLI (Alternativa)

```bash
# Instale a Vercel CLI (se ainda não tiver)
npm i -g vercel

# Login na sua conta Vercel
vercel login

# Deploy
vercel
```

## Configurações Importantes

### Variáveis de Ambiente

Na Vercel, vá até seu projeto e na seção "Settings > Environment Variables", adicione:

- `DATABASE_URL` = URL do banco PostgreSQL (ex: postgres://usuario:senha@seu-host:5432/nome-do-banco)
- `NODE_ENV` = production

### Domínio Personalizado (Opcional)

1. Na Vercel, acesse seu projeto
2. Vá para "Settings > Domains"
3. Adicione seu domínio personalizado e siga as instruções para configurar os registros DNS

## Verificação do Deploy

Após o deploy, acesse seu site na URL fornecida pela Vercel (formato: `https://nome-do-projeto.vercel.app`).

Para verificar se a API está funcionando corretamente, acesse:
- `https://nome-do-projeto.vercel.app/api/status`

Se o deploy for bem-sucedido, você verá a mensagem de status da API.

## Solução de Problemas

Se encontrar problemas com o deploy, verifique:

1. Logs de build e deploy na Vercel
2. Certifique-se de que as variáveis de ambiente estão configuradas corretamente
3. Verifique se o banco de dados PostgreSQL permite conexões da Vercel (geralmente precisa permitir conexões de qualquer IP)

## Suporte

Para obter ajuda com o deploy, consulte a [documentação da Vercel](https://vercel.com/docs) ou entre em contato com o suporte.