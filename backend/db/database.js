const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
      title       VARCHAR(120) NOT NULL CHECK (char_length(trim(title)) > 0),
      description TEXT,
      due_date    DATE,
      status      VARCHAR(20)  NOT NULL DEFAULT 'Pendente'
                    CHECK (status IN ('Pendente', 'Concluída')),
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);

    CREATE INDEX IF NOT EXISTS idx_tasks_search
      ON tasks USING gin(
        to_tsvector('portuguese', title || ' ' || coalesce(description, ''))
      );
  `);

  console.log('✅  Banco de dados inicializado');
};

module.exports = { pool, initDb };
