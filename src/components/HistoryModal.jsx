export default function HistoryModal({ medication, history, onClose, onDeleteHistory, medications = [] }) {
    // If medication is provided, filter history for that medication.
    // Otherwise, show all history.
    const displayHistory = medication
        ? history.filter(h => h.medicationId === medication.id)
        : history;

    const getMedicationName = (medId, entryName) => {
        // 1. Try to use the snapshot name from the history entry
        if (entryName) return entryName;

        // 2. Try to find the medication in the current list
        const foundMed = medications.find(m => m.id === medId);
        if (foundMed) return foundMed.name;

        // 3. Fallback
        return '削除された薬';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{medication ? `${medication.name} の履歴` : '全体の履歴'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {displayHistory.length === 0 ? (
                        <p className="no-history">履歴はありません</p>
                    ) : (
                        <ul className="history-list-modal">
                            {displayHistory.map(entry => (
                                <li key={entry.id} className="history-item-modal">
                                    <div className="history-info">
                                        {!medication && (
                                            <span className="history-med-name">
                                                {getMedicationName(entry.medicationId, entry.medicationName)}
                                            </span>
                                        )}
                                        <span className="history-time">
                                            {new Date(entry.timestamp).toLocaleString('ja-JP', {
                                                month: 'numeric',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <button
                                        className="delete-history-icon-btn"
                                        onClick={() => {
                                            if (window.confirm('この履歴を削除しますか？')) onDeleteHistory(entry.id);
                                        }}
                                        title="削除"
                                    >
                                        🗑️
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
