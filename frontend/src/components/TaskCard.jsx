// Formata uma data ISO (YYYY-MM-DD) para o formato brasileiro (DD/MM/AAAA).
function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === 'Concluída') return false;
  // Compara só a data, sem horário, para evitar problema de fuso.
  return new Date(dateStr.split('T')[0] + 'T00:00:00') < new Date(new Date().toDateString());
}

export default function TaskCard({ task, onEdit, onDelete, onToggle }) {
  const done    = task.status === 'Concluída';
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <article className={`task-card${done ? ' done' : ''}`}>
      <div className="task-top">
        <input
          type="checkbox"
          className="task-check"
          checked={done}
          onChange={() => onToggle(task)}
          title={done ? 'Marcar como pendente' : 'Marcar como concluída'}
          aria-label={`Marcar "${task.title}" como ${done ? 'pendente' : 'concluída'}`}
        />
        <span className={`task-title${done ? ' done' : ''}`}>{task.title}</span>
        <div className="task-actions">
          <button className="btn-icon" onClick={() => onEdit(task)} aria-label="Editar tarefa">
            editar
          </button>
          <button className="btn-icon danger" onClick={() => onDelete(task)} aria-label="Excluir tarefa">
            excluir
          </button>
        </div>
      </div>

      <div className="task-meta">
        {task.description && (
          <p className="task-desc">{task.description}</p>
        )}
        <span className={`badge ${done ? 'badge-done' : 'badge-pending'}`}>
          {task.status}
        </span>
        {task.due_date && (
          <span className={`badge-date${overdue ? ' overdue' : ''}`}>
            {overdue ? '⚠ ' : ''}{formatDate(task.due_date)}
          </span>
        )}
      </div>
    </article>
  );
}
