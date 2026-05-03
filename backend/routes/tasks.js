const express = require('express');
const router  = express.Router();
const { pool } = require('../db/database');

// ── Helpers ──────────────────────────────────────────────────────────────────

// Valida os campos de entrada e retorna um array de erros.
// Centralizar a validação aqui garante consistência entre POST e PUT.
function validateTask({ title, due_date, status }) {
  const errors = [];

  if (!title || !title.trim()) {
    errors.push('O campo "título" é obrigatório.');
  }
  if (title && title.trim().length > 120) {
    errors.push('O título deve ter no máximo 120 caracteres.');
  }
  if (due_date) {
    const d = new Date(due_date);
    if (isNaN(d.getTime())) errors.push('A data prevista é inválida.');
  }
  if (status && !['Pendente', 'Concluída'].includes(status)) {
    errors.push('Status inválido. Use "Pendente" ou "Concluída".');
  }

  return errors;
}

// ── GET /api/tasks ────────────────────────────────────────────────────────────
// Suporta os query params: ?search=texto&status=Pendente
router.get('/', async (req, res, next) => {
  try {
    const { search, status } = req.query;

    // Construção dinâmica da query usando parâmetros numerados ($1, $2…)
    // para evitar SQL Injection — nunca interpole variáveis diretamente na string.
    const conditions = [];
    const params     = [];

    if (search) {
      params.push(`%${search}%`);
      // ILIKE = LIKE case-insensitive no PostgreSQL
      conditions.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql   = `SELECT * FROM tasks ${where} ORDER BY created_at DESC`;

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/tasks/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Tarefa não encontrada.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/tasks ───────────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { title, description, due_date, status = 'Pendente' } = req.body;

    const errors = validateTask({ title, due_date, status });
    if (errors.length) return res.status(422).json({ errors });

    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, due_date, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title.trim(), description || null, due_date || null, status]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/tasks/:id ────────────────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, due_date, status } = req.body;

    const errors = validateTask({ title, due_date, status });
    if (errors.length) return res.status(422).json({ errors });

    const { rows } = await pool.query(
      `UPDATE tasks
       SET title       = $1,
           description = $2,
           due_date    = $3,
           status      = $4,
           updated_at  = now()
       WHERE id = $5
       RETURNING *`,
      [title.trim(), description || null, due_date || null, status, req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Tarefa não encontrada.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Tarefa não encontrada.' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
