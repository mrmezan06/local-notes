export default function EmptyTrashView() {
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
        marginTop: '1.5rem',
      }}
    >
      The System Trash Bin Is Empty
    </div>
  );
}
