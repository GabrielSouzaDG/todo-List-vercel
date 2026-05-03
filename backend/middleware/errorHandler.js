const errorHandler = (err, _req, res, _next) => {
  console.error(err);

  // Erros de constraint do postgresql (ex.: CHECK violation)
  if (err.code === '23514') {
    return res.status(422).json({ error: 'Dados inválidos para o banco de dados.' });
  }

  res.status(500).json({ error: 'Erro interno do servidor.' });
};

module.exports = errorHandler;
