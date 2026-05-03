export default function Toast({ message, type = 'success' }) {
  if (!message) return null;
  return (
    <div className={`toast${type === 'error' ? ' error' : ''}`} role="alert" aria-live="polite">
      {message}
    </div>
  );
}
