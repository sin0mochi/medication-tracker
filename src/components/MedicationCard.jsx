import { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';

export default function MedicationCard({ medication, lastDose, onRecord, onReset, onDelete, onShowHistory }) {
    const [elapsed, setElapsed] = useState('');
    const [status, setStatus] = useState('safe'); // 'safe', 'wait'
    const [remainingTime, setRemainingTime] = useState('');
    const [availableTime, setAvailableTime] = useState('');

    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
        isDanger: false,
        confirmText: 'OK'
    });

    const isPreset = medication.id.startsWith('preset-');

    useEffect(() => {
        if (!lastDose) {
            setElapsed('服用可能');
            setStatus('safe');
            setAvailableTime('');
            return;
        }

        const updateTimer = () => {
            const now = new Date();
            const last = new Date(lastDose.timestamp);
            const diff = now - last;

            // Elapsed time (Compact format H:MM)
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const minutesStr = minutes.toString().padStart(2, '0');
            setElapsed(`${hours}:${minutesStr}`);

            // Check interval
            const intervalMs = medication.intervalHours * 60 * 60 * 1000;
            if (diff < intervalMs) {
                setStatus('wait');
                const remaining = intervalMs - diff;
                const rHours = Math.floor(remaining / (1000 * 60 * 60));
                const rMinutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                const rMinutesStr = rMinutes.toString().padStart(2, '0');
                setRemainingTime(`${rHours}:${rMinutesStr}`);

                // Calculate available time
                const nextDoseTime = new Date(last.getTime() + intervalMs);
                setAvailableTime(nextDoseTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
            } else {
                setStatus('safe');
                setRemainingTime('');
                setAvailableTime('');
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000);

        return () => clearInterval(interval);
    }, [lastDose, medication.intervalHours]);

    const handleRecord = () => {
        if (status === 'wait') {
            setConfirmConfig({
                title: '強制服用',
                message: `まだ服用間隔（${medication.intervalHours}時間）が経過していません。\n本当に記録しますか？`,
                onConfirm: () => onRecord(medication.id),
                isDanger: true,
                confirmText: '記録する'
            });
            setShowConfirmModal(true);
            return;
        }
        onRecord(medication.id);
    };

    const handleReset = (e) => {
        e.stopPropagation();
        setConfirmConfig({
            title: '回数リセット',
            message: '回数をリセットしますか？',
            onConfirm: () => onReset(medication.id),
            isDanger: false,
            confirmText: 'リセット'
        });
        setShowConfirmModal(true);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        setConfirmConfig({
            title: '薬の削除',
            message: `「${medication.name}」を削除しますか？\n履歴も削除される可能性があります。`,
            onConfirm: () => onDelete(medication.id),
            isDanger: true,
            confirmText: '削除'
        });
        setShowConfirmModal(true);
    };

    return (
        <>
            <div className={`medication-card ${status}`}>
                <div className="card-header-compact">
                    <div className="header-left">
                        <h2 className="med-name">{medication.name}</h2>
                        <div className="med-details-row">
                            <span className="category-badge">{medication.category || 'その他'}</span>
                            <div className="dose-counter-minimal">
                                <span className="count-value-minimal">{medication.doseCount || 0}</span>
                                <button
                                    className="reset-btn-minimal"
                                    onClick={handleReset}
                                    title="回数をリセット"
                                >
                                    ↺
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button
                            className="header-icon-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowHistory(medication);
                            }}
                            title="履歴を表示"
                        >
                            📅
                        </button>
                        {!isPreset && (
                            <button
                                className="header-icon-btn delete"
                                onClick={handleDelete}
                                title="薬を削除"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                <div className="card-body-compact">
                    <div className="time-display">
                        {status === 'wait' ? (
                            <>
                                <div className="status-indicator">
                                    <span className="wait-label">⏳ {remainingTime}</span>
                                </div>
                                <div className="sub-info">
                                    目安: {availableTime}〜
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="elapsed-time">
                                    {lastDose ? elapsed : '服用可能'}
                                </div>
                                {lastDose && (
                                    <div className="sub-info">
                                        前回: {new Date(lastDose.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <button
                        className="record-btn-icon"
                        onClick={handleRecord}
                        title={status === 'wait' ? '強制服用' : '服用'}
                    >
                        💊
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                {...confirmConfig}
            />
        </>
    );
}
