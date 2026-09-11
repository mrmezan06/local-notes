export default function EmptySearchResults() {
  return (
    <div
      className="card"
      style={{
        borderStyle: 'dashed',
        textAlign: 'center',
        padding: '5rem',
        color: 'var(--text-muted)',
        fontStyle: 'italic',
        fontSize: '0.85rem',
      }}
    >
      No local document files matched your deep text query lookup.
    </div>
  );
}
