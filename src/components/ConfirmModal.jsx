import React from 'react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'OK', cancelText = 'キャンセル', isDanger = false }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <p style={{ whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>{message}</p>
                    <div className="control-row" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                        <button className="action-btn secondary" onClick={onClose}>
                            {cancelText}
                        </button>
                        <button
                            className={`action-btn ${isDanger ? 'danger' : 'primary'}`}
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
