import { useState, useRef } from 'react';
import ConfirmModal from './ConfirmModal';

export default function HistoryModal({ medication, history, onClose, onDeleteHistory, onUpdateHistory, medications = [] }) {
    const [editingId, setEditingId] = useState(null);
    const [editTime, setEditTime] = useState('');

    // Confirm Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
        isDanger: false,
        confirmText: 'OK'
    });

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

    const startEditing = (entry) => {
        setEditingId(entry.id);
        // Convert ISO string to datetime-local format (YYYY-MM-DDThh:mm)
        const date = new Date(entry.timestamp);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        setEditTime(date.toISOString().slice(0, 16));
    };

    const saveEdit = (id) => {
        if (editTime) {
            onUpdateHistory(id, new Date(editTime).toISOString());
            setEditingId(null);
            setEditTime('');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTime('');
    };

    const handleDeleteClick = (entryId) => {
        setConfirmConfig({
            title: '履歴の削除',
            message: 'この履歴を削除しますか？\nこの操作は取り消せません。',
            onConfirm: () => onDeleteHistory(entryId),
            isDanger: true,
            confirmText: '削除'
        });
        setShowConfirmModal(true);
    };

    // Long press logic for delete
    const [pressTimer, setPressTimer] = useState(null);
    const isLongPress = useRef(false);
    const ignoreClick = useRef(false);
    const pressingId = useRef(null);

    const handleDeleteDown = (entryId) => {
        isLongPress.current = false;
        ignoreClick.current = false;
        pressingId.current = entryId;
        const timer = setTimeout(() => {
            isLongPress.current = true;
            ignoreClick.current = true;
            onDeleteHistory(entryId);
            if (navigator.vibrate) navigator.vibrate(50);
        }, 800);
        setPressTimer(timer);
    };

    const handleDeleteUp = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            setPressTimer(null);
        }
        pressingId.current = null;
    };

    const handleDeleteLeave = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            setPressTimer(null);
        }
        pressingId.current = null;
    };

    const handleDeleteClickWrapper = (entryId) => {
        if (ignoreClick.current) {
            ignoreClick.current = false;
            return;
        }
        handleDeleteClick(entryId);
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

                                        {editingId === entry.id ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="datetime-local"
                                                    value={editTime}
                                                    onChange={(e) => setEditTime(e.target.value)}
                                                    style={{ padding: '0.2rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                                />
                                                <button onClick={() => saveEdit(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✅</button>
                                                <button onClick={cancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>❌</button>
                                            </div>
                                        ) : (
                                            <span className="history-time">
                                                {new Date(entry.timestamp).toLocaleString('ja-JP', {
                                                    month: 'numeric',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        )}
                                    </div>

                                    {editingId !== entry.id && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="delete-history-icon-btn"
                                                onClick={() => startEditing(entry)}
                                                title="編集"
                                                style={{ fontSize: '1rem' }}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className={`delete-history-icon-btn ${pressTimer && pressingId.current === entry.id ? 'is-pressing' : ''}`}
                                                onMouseDown={() => handleDeleteDown(entry.id)}
                                                onMouseUp={handleDeleteUp}
                                                onMouseLeave={handleDeleteLeave}
                                                onTouchStart={() => handleDeleteDown(entry.id)}
                                                onTouchEnd={handleDeleteUp}
                                                onClick={() => handleDeleteClickWrapper(entry.id)}
                                                title="削除（長押しで即削除）"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Render ConfirmModal inside the overlay but it has its own overlay. 
                Using a wrapper with high z-index to ensure it appears on top. */}
            {showConfirmModal && (
                <div style={{ position: 'fixed', zIndex: 2000, top: 0, left: 0, width: '100%', height: '100%' }}>
                    <ConfirmModal
                        isOpen={showConfirmModal}
                        onClose={() => setShowConfirmModal(false)}
                        {...confirmConfig}
                    />
                </div>
            )}
        </div>
    );
}
