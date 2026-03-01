# Estágio de build
FROM node:20-alpine AS builder

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar todas as dependências incluindo as de desenvolvimento
RUN npm install

# Copiar o restante do código fonte
COPY . .

# Compilar o frontend com npx 
# O vite.config.ts está configurado para gerar os arquivos em dist/public
RUN npx vite build

# Criar arquivo pathResolver.ts se não existir
RUN [ -f server/pathResolver.ts ] || echo 'import path from "path"; import fs from "fs"; export function getPublicDir() { return process.cwd(); }' > server/pathResolver.ts

# Compilar o backend com npx - definindo vite como externo para evitar erros
RUN npx esbuild server/index.ts server/db.ts server/storage.ts server/initializeDatabase.ts server/auth.ts server/routes.ts server/pathResolver.ts --platform=node --packages=external --external:vite --bundle --format=esm --outdir=dist

# Compilar server/vite.ts separadamente para melhor compatibilidade
RUN npx esbuild server/vite.ts --platform=node --packages=external --external:vite --bundle --format=esm --outdir=dist

# Adicionar fallbacks para evitar erros de path.resolve
RUN echo 'export const __dirname = process.cwd();' > dist/dirname-polyfill.js

# Mostrar os arquivos gerados para debug
RUN echo "Conteúdo do diretório dist:"
RUN ls -la dist/
RUN echo "Conteúdo do diretório dist/public:"
RUN ls -la dist/public/

# Estágio de produção
FROM node:20-alpine

# Argumentos de build para variáveis de ambiente (preenchidos pelo comando docker build --build-arg)
ARG VITE_LOGO_URL
ARG VITE_WEBHOOK_URL
ARG VITE_WHATSAPP_NUMBER
ARG DB_HOST
ARG DB_PORT
ARG DB_USER
ARG DB_PASSWORD
ARG DB_NAME
ARG DATABASE_URL
ARG SESSION_SECRET
ARG NODE_ENV=production

# Configurações de ambiente
ENV NODE_ENV=${NODE_ENV}
ENV PORT=5000
ENV NODE_OPTIONS=--experimental-specifier-resolution=node

# Definir variáveis do servidor para produção
ENV SERVE_STATIC=true

# Variáveis de ambiente da aplicação
ENV VITE_LOGO_URL=${VITE_LOGO_URL:-https://meudominio.com/nomedaimagem.svg}
ENV VITE_WEBHOOK_URL=${VITE_WEBHOOK_URL:-https://webhook.dev.testandoaulanapratica.shop/webhook/portfolio_virtual}
ENV VITE_WHATSAPP_NUMBER=${VITE_WHATSAPP_NUMBER:-5544999998888}

# Variáveis de ambiente do banco de dados
ENV DB_HOST=${DB_HOST}
ENV DB_PORT=${DB_PORT}
ENV DB_USER=${DB_USER}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV DB_NAME=${DB_NAME}
ENV DATABASE_URL=${DATABASE_URL}
ENV SESSION_SECRET=${SESSION_SECRET:-chave_secreta_padrao_para_sessao}

# Diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar todas as dependências incluindo devDeps (vite é devDep mas importado em runtime)
# NODE_ENV=production faz npm skip devDeps — forçamos com --include=dev
RUN npm install --include=dev

# Criar estrutura de diretórios necessária
RUN mkdir -p dist/public server/public shared

# Copiar arquivos compilados do estágio de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/entrypoint.cjs ./entrypoint.cjs
COPY --from=builder /app/entrypoint.mjs ./entrypoint.mjs
COPY --from=builder /app/start-simple.js ./start-simple.js

# Criar arquivos vazios de fallback para evitar erros de caminho
RUN echo "{}" > ./server/package.json
RUN echo "<!DOCTYPE html><html><head><title>App</title></head><body><div id='root'></div></body></html>" > ./dist/public/index.html

# Garantir que a pasta server e arquivos relacionados existam
COPY --from=builder /app/server/vite.ts ./server/vite.ts
COPY --from=builder /app/server/pathResolver.ts ./server/pathResolver.ts
COPY --from=builder /app/vite.config.ts ./vite.config.ts

# Copiar todos os arquivos estáticos do build
COPY --from=builder /app/dist/public ./dist/public

# Adicionar arquivo .env para variáveis de ambiente (será sobrescrito pelos valores do container)
RUN echo "DATABASE_URL=$DATABASE_URL" > .env
RUN echo "SESSION_SECRET=$SESSION_SECRET" >> .env

# Expor a porta padrão
EXPOSE 5000

# Copiar e tornar executável o script de inicialização (converte CRLF→LF do Windows)
COPY start.sh /app/start.sh
RUN sed -i 's/\r//' /app/start.sh && chmod +x /app/start.sh

# Iniciar a aplicação
CMD ["/app/start.sh"]