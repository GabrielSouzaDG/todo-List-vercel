// Componente de notificação temporária (toast).
// Recebe a mensagem e um tipo ('success' | 'error') e some após 2.8s.
export default function Toast({ message, type = 'success' }) {
  if (!message) return null;
  return (
    <div className={`toast${type === 'error' ? ' error' : ''}`} role="alert" aria-live="polite">
      {message}
    </div>
  );
}
