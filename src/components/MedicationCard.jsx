import { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';
import TimeRecordModal from './TimeRecordModal';

export default function MedicationCard({ medication, lastDose, lastCategoryDose, onRecord, onReset, onDelete, onShowHistory }) {
    const [elapsed, setElapsed] = useState('');
    const [status, setStatus] = useState('safe'); // 'safe', 'wait'
    const [remainingTime, setRemainingTime] = useState('');
    const [availableTime, setAvailableTime] = useState('');

    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
        isDanger: false,
        confirmText: 'OK'
    });

    const isPreset = medication.id.startsWith('preset-');
    const isManual = !isPreset;

    // Check for category overlap for display
    const isOverlapping = (() => {
        if (!lastCategoryDose || (lastDose && lastCategoryDose.id === lastDose.id)) return false;
        const now = new Date();
        const lastCat = new Date(lastCategoryDose.timestamp);
        const diff = now - lastCat;
        const intervalMs = medication.intervalHours * 60 * 60 * 1000;
        return diff < intervalMs;
    })();

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

    const handleRecord = (timestamp = null) => {
        // 1. Check if this specific medication is safe to take
        // If timestamp is provided (manual time entry), we skip the "wait" check relative to NOW,
        // but ideally we should check relative to the provided time. For simplicity, we'll warn if status is currently wait.
        // Or if it's a past record, maybe we don't need to warn? Let's keep it simple: warn if currently in wait status.
        if (status === 'wait' && !timestamp) {
            setConfirmConfig({
                title: '強制服用',
                message: `まだ服用間隔（${medication.intervalHours}時間）が経過していません。\n本当に記録しますか？`,
                onConfirm: () => onRecord(medication.id, timestamp),
                isDanger: true,
                confirmText: '記録する'
            });
            setShowConfirmModal(true);
            return;
        }

        // 2. Check overlap
        if (lastCategoryDose && (!lastDose || lastCategoryDose.id !== lastDose.id)) {
            const now = timestamp || new Date();
            const lastCat = new Date(lastCategoryDose.timestamp);
            const diff = now - lastCat;
            const intervalMs = medication.intervalHours * 60 * 60 * 1000;

            // Only warn if the time difference is less than interval AND the new dose is AFTER the last category dose
            // (If recording a past dose that was BEFORE the last category dose, overlap logic might be complex, but let's assume simple sequential check)
            if (diff > 0 && diff < intervalMs) {
                setConfirmConfig({
                    title: '同カテゴリ薬の服用',
                    message: `同じカテゴリ（${medication.category}）の薬「${lastCategoryDose.medicationName}」が\n${Math.floor(diff / (1000 * 60))}分前に服用されています。\n本当に記録しますか？`,
                    onConfirm: () => onRecord(medication.id, timestamp),
                    isDanger: true,
                    confirmText: '記録する'
                });
                setShowConfirmModal(true);
                return;
            }
        }

        onRecord(medication.id, timestamp);
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

    // Determine display status and color
    let displayStatus = 'safe';
    let statusText = '服用可能';
    let statusColor = 'var(--status-safe)';
    let showTimer = false;

    if (isOverlapping) {
        displayStatus = 'overlap';
        statusText = '同類服用中';
        statusColor = '#F6E05E'; // Match yellow border
    } else if (status === 'wait') {
        displayStatus = 'wait';
        statusText = '待機中';
        statusColor = 'var(--status-wait)';
        showTimer = true;
    }

    return (
        <>
            <div className={`medication-card ${status} ${isOverlapping ? 'category-overlap' : ''}`}>
                {/* Header: Name and History/Delete */}
                <div className="card-header-new">
                    <div className="name-row">
                        <h3>{medication.name}</h3>
                        {isManual && <span className="manual-badge" title="手動追加">✏️</span>}
                    </div>
                    <button
                        className="icon-btn"
                        onClick={() => onShowHistory(medication)}
                        title="履歴"
                    >
                        📅
                    </button>
                    {!isPreset && (
                        <button
                            className="icon-btn delete-btn"
                            onClick={handleDelete}
                            title="削除"
                            style={{ marginLeft: '0.5rem', opacity: 0.5 }}
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Middle: Timer/Next Dose (Left) and Category/Count (Right) */}
                <div className="card-body-new">
                    <div className="body-left">
                        <div className="status-row-single-line">
                            <div className="timer-display" style={{ color: statusColor }}>
                                {showTimer ? (
                                    <>
                                        <span className="timer-icon">⏳</span>
                                        <span className="time-remaining">{remainingTime}</span>
                                    </>
                                ) : (
                                    <span className="status-text-large">{statusText}</span>
                                )}
                            </div>
                            <div className="next-dose-info">
                                {showTimer ? `(${availableTime})` : (lastDose && `(${new Date(lastDose.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })})`)}
                            </div>
                        </div>
                    </div>
                    <div className="body-right">
                        <span className={`category-badge category-${medication.category ? medication.category.replace(/\s+/g, '-') : 'other'}`}>
                            {medication.category || 'その他'}
                        </span>
                    </div>
                </div>

                {/* Bottom: Buttons (Record & Time Specify & Count) */}
                <div className="card-footer-new">
                    <button
                        className="record-btn-rect"
                        onClick={() => handleRecord()}
                        title={status === 'wait' ? '強制服用' : '服用'}
                        disabled={status === 'wait'}
                    >
                        <span className="btn-icon">💊</span>
                    </button>

                    <div className="footer-right-group">
                        <button
                            className="time-btn-rect-small"
                            onClick={() => setShowTimeModal(true)}
                            title="時間を指定して記録"
                        >
                            <span className="btn-icon">🕒</span>
                        </button>
                        <button
                            className="count-btn-rect"
                            onClick={handleReset}
                            title="回数をリセット"
                        >
                            <span className="count-number">{medication.doseCount || 0}</span>
                            <span className="count-label">回</span>
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                {...confirmConfig}
            />

            <TimeRecordModal
                isOpen={showTimeModal}
                onClose={() => setShowTimeModal(false)}
                onConfirm={(date) => handleRecord(date)}
                medicationName={medication.name}
            />
        </>
    );
}
