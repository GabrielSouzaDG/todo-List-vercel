// Middleware de erro centralizado do Express.
// Qualquer chamada a next(err) em uma rota cai aqui.
// Isso evita repetir blocos try/catch com res.status(500) espalhados.
const errorHandler = (err, _req, res, _next) => {
  console.error(err);

  // Erros de constraint do PostgreSQL (ex.: CHECK violation)
  if (err.code === '23514') {
    return res.status(422).json({ error: 'Dados inválidos para o banco de dados.' });
  }

  res.status(500).json({ error: 'Erro interno do servidor.' });
};

module.exports = errorHandler;
