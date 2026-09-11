import ReactMarkdown from 'react-markdown';

export default function MarkdownCanvas({ value, onChange, isReaderMode }) {
  const handleKeyDownIntercept = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const tabIndentation = '  ';
      const updatedValue =
        value.substring(0, selectionStart) +
        tabIndentation +
        value.substring(selectionEnd);

      onChange(updatedValue);

      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd =
          selectionStart + tabIndentation.length;
      }, 0);
    }
  };

  return (
    <div
      className={`editor-split-container ${isReaderMode ? 'reader-mode-active' : ''}`}
    >
      {/* 1. Left Input Area */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDownIntercept}
        placeholder="# Header 1&#10;## Header 2&#10;**Bold text content**&#10;- Unordered list item"
        className="editor-canvas-textarea"
      />

      {/* 2. Right Adaptive Output Preview Box */}
      <div className="markdown-preview-pane">
        {value ? (
          <ReactMarkdown>{value}</ReactMarkdown>
        ) : (
          <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>
            Live compiled output view...
          </p>
        )}
      </div>
    </div>
  );
}
