import { useState } from 'react';

const EMPTY = { title: '', description: '', due_date: '', status: 'Pendente' };

// Espelha as validações do backend para feedback imediato sem round-trip.
function validate({ title, due_date }) {
  const errors = {};
  if (!title.trim()) errors.title = 'O título é obrigatório.';
  if (title.trim().length > 120) errors.title = 'Máximo de 120 caracteres.';
  if (due_date) {
    const d = new Date(due_date + 'T00:00:00');
    if (isNaN(d.getTime())) errors.due_date = 'Data inválida.';
  }
  return errors;
}

export default function TaskModal({ task, onSave, onClose, loading }) {
  const [form, setForm]   = useState(task ? { ...task } : { ...EMPTY });
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  function handleSubmit() {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ ...form, title: form.title.trim() });
  }

  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal">
        <h2 id="modal-title">{task ? 'Editar tarefa' : 'Nova tarefa'}</h2>

        <div className="field">
          <label htmlFor="f-title">Título *</label>
          <input
            id="f-title"
            type="text"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Ex.: Finalizar relatório..."
            maxLength={120}
            autoFocus
          />
          {errors.title && <div className="field-error">{errors.title}</div>}
        </div>

        <div className="field">
          <label htmlFor="f-desc">Descrição</label>
          <textarea
            id="f-desc"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Detalhes opcionais..."
            maxLength={500}
          />
        </div>

        <div className="field">
          <label htmlFor="f-date">Data prevista</label>
          <input
            id="f-date"
            type="date"
            value={form.due_date}
            onChange={e => set('due_date', e.target.value)}
          />
          {errors.due_date && <div className="field-error">{errors.due_date}</div>}
        </div>

        <div className="field">
          <label htmlFor="f-status">Status</label>
          <select
            id="f-status"
            value={form.status}
            onChange={e => set('status', e.target.value)}
          >
            <option>Pendente</option>
            <option>Concluída</option>
          </select>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
