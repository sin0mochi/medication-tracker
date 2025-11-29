export default function HistoryList({ history, medications, onRemove }) {
    if (history.length === 0) return null;

    const getMedicationName = (entry) => {
        if (entry.medicationName) return entry.medicationName;
        const med = medications.find(m => m.id === entry.medicationId);
        return med ? med.name : '削除された薬';
    };

    return (
        <div className="history-container">
            <h3>履歴</h3>
            <ul className="history-list">
                {history.map((entry) => (
                    <li key={entry.id} className="history-item">
                        <div className="history-info">
                            <span className="history-med-name">{getMedicationName(entry)}</span>
                            <span className="history-time">
                                {new Date(entry.timestamp).toLocaleString('ja-JP', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                        <button
                            className="delete-history-icon-btn"
                            onClick={() => onRemove(entry.id)}
                            aria-label="削除"
                        >
                            🗑️
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
