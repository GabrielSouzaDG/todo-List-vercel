require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const { initDb } = require('./db/database');
const tasksRouter = require('./routes/tasks');
const errorHandler = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globais ──────────────────────────────────────────────────────
// cors() permite que o frontend (em outro domínio) consuma esta API.
// Em produção, restrinja o origin para o domínio real do seu frontend.
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

// express.json() faz o parse automático do body das requisições JSON.
app.use(express.json());

// ── Rotas ────────────────────────────────────────────────────────────────────
app.use('/api/tasks', tasksRouter);

// Health check — Railway usa esse endpoint para saber se a app está viva.
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Error handler centralizado ───────────────────────────────────────────────
app.use(errorHandler);

// ── Inicialização ────────────────────────────────────────────────────────────
// Garante que a tabela existe antes de começar a aceitar requisições.
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅  Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌  Falha ao inicializar o banco de dados:', err);
    process.exit(1);
  });
