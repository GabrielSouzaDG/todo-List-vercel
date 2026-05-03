import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// StrictMode ativa verificações extras em desenvolvimento:
// detecta efeitos colaterais inesperados e APIs deprecadas.
// Em produção ele não tem custo.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
