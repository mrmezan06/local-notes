export default function EmptyContactResults() {
  return (
    <div
      className="card"
      style={{
        borderStyle: 'dashed',
        textAlign: 'center',
        padding: '4rem',
        color: 'var(--text-muted)',
        fontStyle: 'italic',
        fontSize: '0.85rem',
        width: '100%',
      }}
    >
      No localized contact cards matched your query parameter lookup trace.
    </div>
  );
}
