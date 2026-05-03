import { useState, useEffect, useCallback, useRef } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from './services/api';
import TaskCard   from './components/TaskCard';
import TaskModal  from './components/TaskModal';
import Toast      from './components/Toast';
import './styles/global.css';

export default function App() {
  // ── Estado principal ────────────────────────────────────────────────────────
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(false);   // carregando lista
  const [saving,  setSaving]  = useState(false);   // salvando tarefa
  const [modal,   setModal]   = useState(null);    // null | 'new' | objeto tarefa
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('Todas');
  const [toast,   setToast]   = useState(null);    // { message, type }

  // Ref para o timeout do debounce da pesquisa
  const searchTimeout = useRef(null);

  // ── Feedback visual ─────────────────────────────────────────────────────────
  // Exibe um toast e o remove automaticamente após 2.8s.
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  // ── Busca de tarefas ────────────────────────────────────────────────────────
  // Usa debounce no campo de pesquisa para não disparar uma request a cada tecla.
  const fetchTasks = useCallback(async (searchValue, filterValue) => {
    setLoading(true);
    try {
      const params = {};
      if (searchValue)              params.search = searchValue;
      if (filterValue !== 'Todas') params.status = filterValue;
      const data = await getTasks(params);
      setTasks(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Busca inicial ao montar o componente
  useEffect(() => {
    fetchTasks('', 'Todas');
  }, [fetchTasks]);

  // Debounce: espera 350ms após o usuário parar de digitar antes de buscar
  function handleSearchChange(value) {
    setSearch(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchTasks(value, filter), 350);
  }

  function handleFilterChange(value) {
    setFilter(value);
    fetchTasks(search, value);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  async function handleSave(formData) {
    setSaving(true);
    try {
      const isEdit = modal && modal !== 'new';
      if (isEdit) {
        const updated = await updateTask(modal.id, formData);
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
        showToast('Tarefa atualizada!');
      } else {
        const created = await createTask(formData);
        setTasks(prev => [created, ...prev]);
        showToast('Tarefa criada!');
      }
      setModal(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(task) {
    if (!confirm(`Excluir "${task.title}"?`)) return;
    try {
      await deleteTask(task.id);
      setTasks(prev => prev.filter(t => t.id !== task.id));
      showToast('Tarefa excluída.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleToggle(task) {
    const updated = {
      ...task,
      status: task.status === 'Concluída' ? 'Pendente' : 'Concluída',
    };
    try {
      const saved = await updateTask(task.id, updated);
      setTasks(prev => prev.map(t => t.id === saved.id ? saved : t));
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // ── Contadores para o header ─────────────────────────────────────────────────
  const pending = tasks.filter(t => t.status === 'Pendente').length;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <main className="app">
      <header className="header">
        <h1>Tarefas</h1>
        <span className="count">
          {pending} pendente{pending !== 1 ? 's' : ''} · {tasks.length} total
        </span>
      </header>

      <div className="toolbar">
        <input
          className="input-search"
          type="text"
          placeholder="Pesquisar tarefas..."
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          aria-label="Pesquisar tarefas"
        />
        <select
          className="select-filter"
          value={filter}
          onChange={e => handleFilterChange(e.target.value)}
          aria-label="Filtrar por status"
        >
          <option>Todas</option>
          <option>Pendente</option>
          <option>Concluída</option>
        </select>
        <button className="btn-primary" onClick={() => setModal('new')}>
          + Nova tarefa
        </button>
      </div>

      <div className="task-list" aria-live="polite" aria-label="Lista de tarefas">
        {loading && <p className="empty">Carregando...</p>}
        {!loading && tasks.length === 0 && (
          <p className="empty">
            {search || filter !== 'Todas'
              ? 'Nenhuma tarefa encontrada para os filtros aplicados.'
              : 'Nenhuma tarefa ainda. Crie a primeira!'}
          </p>
        )}
        {!loading && tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={setModal}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {modal && (
        <TaskModal
          task={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </main>
  );
}
