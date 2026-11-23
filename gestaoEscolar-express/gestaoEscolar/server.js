/*
 * server.js — back-end do Sistema de Gerenciamento Escolar (Express.js).
 *
 * Estrutura monolítica: front-end (pasta public/) e back-end (este arquivo)
 * vivem no mesmo projeto e no mesmo processo. O Express entrega as páginas
 * HTML, CSS, JS e imagens; a lógica de tela continua em public/js.
 *
 * Uso:  npm install  →  npm start  →  http://localhost:3000
 */
const express = require('express');
const path = require('path');

const app = express();
const PORTA = process.env.PORT || 3000;
const PUBLICO = path.join(__dirname, 'public');

// Não anuncia o framework nos cabeçalhos de resposta.
app.disable('x-powered-by');

// Página inicial: "/" entrega o inicio.html.
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLICO, 'inicio.html'));
});

// Arquivos estáticos (css, js, imgs e as páginas em /pags).
// Só a pasta public/ é exposta: server.js, package.json e node_modules ficam de fora.
app.use(express.static(PUBLICO));

// Qualquer endereço que não existe cai aqui (404).
app.use((req, res) => {
  res.status(404).type('html').send(
    '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">' +
    '<title>Página não encontrada</title></head><body style="font-family:Arial,sans-serif;' +
    'text-align:center;margin-top:20vh"><h1>404</h1><p>Página não encontrada.</p>' +
    '<a href="/">Voltar ao início</a></body></html>'
  );
});

// Erros inesperados: registra no servidor e responde sem expor detalhes.
app.use((erro, req, res, next) => {
  console.error(erro);
  if (res.headersSent) { return next(erro); }
  res.status(500).type('text').send('Erro interno do servidor.');
});

// Só abre a porta quando executado diretamente (permite importar o app em testes).
if (require.main === module) {
  app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
  });
}

module.exports = app;
