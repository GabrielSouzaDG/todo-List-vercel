// Camada de serviço: centraliza todas as chamadas HTTP à API.
// Os componentes React nunca fazem fetch() diretamente — eles chamam
// funções daqui. Isso facilita trocar a URL base ou adicionar autenticação
// num único lugar no futuro.

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/tasks`
  : '/api/tasks'; // em desenvolvimento, o proxy do Vite resolve

// Função auxiliar: dispara o fetch, verifica erros HTTP e retorna JSON.
async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.errors?.join(', ') || body.error || `Erro ${res.status}`;
    throw new Error(message);
  }

  // DELETE retorna 204 No Content — não há JSON para parsear.
  if (res.status === 204) return null;
  return res.json();
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export const getTasks = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`${BASE_URL}${query ? `?${query}` : ''}`);
};

export const createTask = (data) =>
  request(BASE_URL, { method: 'POST', body: JSON.stringify(data) });

export const updateTask = (id, data) =>
  request(`${BASE_URL}/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteTask = (id) =>
  request(`${BASE_URL}/${id}`, { method: 'DELETE' });
