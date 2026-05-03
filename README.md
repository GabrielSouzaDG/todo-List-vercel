# ✅ Todo App — React + Node.js + PostgreSQL

Aplicação fullstack de gerenciamento de tarefas com frontend em React, API REST em Node.js/Express e banco de dados PostgreSQL.

> **Deploy:** Frontend no [Vercel](https://vercel.com) · Backend + Banco no [Railway](https://railway.app)

---

## 📋 Funcionalidades

- **Criar** tarefas com título, descrição, data prevista e status
- **Listar** todas as tarefas com contagem de pendentes
- **Editar** qualquer campo de uma tarefa existente
- **Excluir** tarefas com confirmação
- **Pesquisar** por título ou descrição (com debounce)
- **Filtrar** por status: Todas / Pendente / Concluída
- **Marcar** tarefas como concluídas diretamente pelo checkbox
- **Alerta visual** para tarefas com data vencida

---

## 🗂 Estrutura do projeto

```
todo-app/
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskCard.jsx    # Card individual de tarefa
│   │   │   ├── TaskModal.jsx   # Modal de criação/edição
│   │   │   └── Toast.jsx       # Notificações temporárias
│   │   ├── services/
│   │   │   └── api.js          # Camada de comunicação com a API
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx             # Componente raiz (estado + lógica)
│   │   └── main.jsx            # Entry point
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── backend/                # Node.js + Express
    ├── db/
    │   └── database.js         # Pool de conexão + criação da tabela
    ├── middleware/
    │   └── errorHandler.js     # Handler de erros centralizado
    ├── routes/
    │   └── tasks.js            # Endpoints CRUD
    ├── .env.example
    ├── package.json
    └── server.js               # Entry point do servidor
```

---

## 🧠 Decisões técnicas

### Frontend — React + Vite

**React** foi escolhido pelo modelo de componentes reativos, ideal para uma aplicação com múltiplas interações (criar, editar, filtrar). O estado é centralizado no componente `App` e distribuído para os filhos via props — padrão chamado de *lifting state up*, que evita inconsistências.

**Vite** substitui o antigo Create React App por ser ordens de grandeza mais rápido em desenvolvimento (HMR instantâneo) e gerar bundles menores em produção.

### Backend — Node.js + Express

**Express** é minimalista e direto: sem mágica, sem convenções excessivas. A estrutura de rotas (`routes/tasks.js`) separa claramente as responsabilidades. Um middleware de erro centralizado (`errorHandler.js`) captura exceções de qualquer rota via `next(err)`, evitando blocos `try/catch` repetidos com `res.status(500)`.

### Banco de dados — PostgreSQL

**PostgreSQL** oferece tipos de data nativos (`DATE`), constraints declarativas (`CHECK`, `NOT NULL`) que garantem integridade dos dados no próprio banco — independente de quem acessa a API. Todas as queries usam **parâmetros numerados** (`$1`, `$2`...) para prevenção de SQL Injection.

A tabela é criada automaticamente na primeira execução (`CREATE TABLE IF NOT EXISTS`), eliminando a necessidade de rodar migrations manualmente no primeiro deploy.

### Camada de serviço no frontend

O arquivo `src/services/api.js` centraliza todos os `fetch()`. Os componentes nunca fazem chamadas HTTP diretamente — eles chamam funções como `createTask()` ou `deleteTask()`. Isso facilita: trocar a URL base, adicionar headers de autenticação ou substituir por um client como Axios sem tocar nos componentes.

---

## 🚀 Deploy — Passo a passo

### Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Railway](https://railway.app) (gratuita)
- Conta no [Vercel](https://vercel.com) (gratuita)

---

### 1. Subir o código no GitHub

```bash
# Na raiz do projeto clonado/baixado:
git init
git add .
git commit -m "feat: initial commit — todo app fullstack"

# Crie um repositório no GitHub e execute:
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

---

### 2. Deploy do Backend no Railway

O Railway hospeda o Node.js e o PostgreSQL na mesma plataforma.

1. Acesse [railway.app](https://railway.app) e faça login com sua conta GitHub
2. Clique em **New Project → Deploy from GitHub repo**
3. Selecione seu repositório
4. Railway detectará que é um projeto Node.js; configure o **Root Directory** para `backend`
5. Clique em **Add Database → PostgreSQL** para criar o banco
6. Vá em **Variables** e adicione:

| Variável       | Valor                                                   |
|----------------|---------------------------------------------------------|
| `DATABASE_URL` | (Railway já preenche automaticamente ao linkar o banco) |
| `NODE_ENV`     | `production`                                            |
| `FRONTEND_URL` | (deixe em branco por enquanto — você voltará aqui)      |

7. Em **Settings → Networking**, clique em **Generate Domain** para obter a URL pública da sua API (ex.: `https://todo-api-production.railway.app`)

---

### 3. Deploy do Frontend no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **Add New → Project**
3. Importe seu repositório
4. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (detectado automaticamente)
5. Em **Environment Variables**, adicione:

| Variável        | Valor                                               |
|-----------------|-----------------------------------------------------|
| `VITE_API_URL`  | A URL do Railway do passo anterior (sem `/` final)  |

6. Clique em **Deploy**
7. Anote a URL do frontend gerada pelo Vercel (ex.: `https://todo-app.vercel.app`)

---

### 4. Configurar o CORS no Railway

Volte ao Railway e atualize a variável:

| Variável       | Valor                    |
|----------------|--------------------------|
| `FRONTEND_URL` | URL do Vercel (passo 3)  |

O Railway reinicia o servidor automaticamente.

---

## 💻 Rodando localmente

### Pré-requisitos

- [Node.js](https://nodejs.org) >= 18
- PostgreSQL instalado e rodando (ou use o [Docker](#docker))

### Backend

```bash
cd backend
cp .env.example .env          # preencha com sua DATABASE_URL local
npm install
npm run dev                   # inicia com nodemon na porta 3001
```

### Frontend

```bash
cd frontend
cp .env.example .env          # VITE_API_URL pode ficar em branco em dev (proxy do Vite)
npm install
npm run dev                   # inicia na porta 5173
```

Acesse: [http://localhost:5173](http://localhost:5173)

### Docker (opcional, para o PostgreSQL)

```bash
docker run --name todoapp-pg \
  -e POSTGRES_USER=todo \
  -e POSTGRES_PASSWORD=todo \
  -e POSTGRES_DB=todoapp \
  -p 5432:5432 \
  -d postgres:16
```

`DATABASE_URL` correspondente: `postgres://todo:todo@localhost:5432/todoapp`

---

## 🔌 Endpoints da API

| Método   | Rota              | Descrição                          |
|----------|-------------------|------------------------------------|
| `GET`    | `/api/tasks`      | Lista tarefas (`?search=&status=`) |
| `GET`    | `/api/tasks/:id`  | Busca tarefa por ID                |
| `POST`   | `/api/tasks`      | Cria nova tarefa                   |
| `PUT`    | `/api/tasks/:id`  | Atualiza tarefa existente          |
| `DELETE` | `/api/tasks/:id`  | Remove tarefa                      |
| `GET`    | `/health`         | Health check do servidor           |

### Exemplo de payload (POST / PUT)

```json
{
  "title": "Estudar React",
  "description": "Focar em hooks e gerenciamento de estado",
  "due_date": "2025-12-31",
  "status": "Pendente"
}
```

### Validações

- `title` é **obrigatório** e tem no máximo 120 caracteres
- `due_date` deve ser uma data válida no formato `YYYY-MM-DD`
- `status` deve ser `"Pendente"` ou `"Concluída"`

Erros retornam HTTP `422` com o formato:
```json
{ "errors": ["O campo \"título\" é obrigatório."] }
```

---

## 🛡️ Segurança

- **SQL Injection**: todas as queries usam parâmetros numerados do `pg` (`$1`, `$2`…)
- **CORS**: configurado para aceitar apenas o domínio do frontend em produção
- **Variáveis de ambiente**: credenciais nunca commitadas no repositório (`.gitignore`)
- **Constraints no banco**: `CHECK`, `NOT NULL` e `VARCHAR(n)` garantem integridade independente da camada de aplicação

---

## 📦 Tecnologias

| Camada       | Tecnologia             | Motivo da escolha                              |
|--------------|------------------------|------------------------------------------------|
| Frontend     | React 18 + Vite 5      | Reatividade + build ultrarrápido               |
| Backend      | Node.js 18 + Express 4 | Simplicidade, ecosistema maduro                |
| Banco        | PostgreSQL 16          | Robustez, tipos nativos, full-text search      |
| Hospedagem   | Vercel + Railway       | Deploy via GitHub, plano gratuito generoso     |

---

## 📄 Licença

MIT — use, modifique e distribua à vontade.
