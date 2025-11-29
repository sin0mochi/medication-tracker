import { useState, useEffect } from 'react';

export default function TimeRecordModal({ isOpen, onClose, onConfirm, medicationName }) {
    const [selectedTime, setSelectedTime] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Set default to current time, adjusted for timezone offset to show correctly in datetime-local
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            setSelectedTime(now.toISOString().slice(0, 16));
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedTime) return;

        const date = new Date(selectedTime);
        onConfirm(date);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>時間指定記録</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <p style={{ marginBottom: '1rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                        「{medicationName}」を服用した時間を指定してください。
                    </p>
                    <form onSubmit={handleSubmit} className="add-med-form">
                        <div className="form-group">
                            <label htmlFor="record-time">服用日時</label>
                            <input
                                type="datetime-local"
                                id="record-time"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                required
                                max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                            />
                        </div>
                        <button type="submit" className="submit-btn">
                            記録する
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
