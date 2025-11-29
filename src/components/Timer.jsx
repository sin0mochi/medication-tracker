import { useState, useEffect } from 'react';

export default function Timer({ lastDoseTime }) {
    const [elapsed, setElapsed] = useState('');

    useEffect(() => {
        if (!lastDoseTime) {
            setElapsed('未服用');
            return;
        }

        const updateTimer = () => {
            const now = new Date();
            const last = new Date(lastDoseTime);
            const diff = now - last;

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setElapsed(`${hours}時間 ${minutes}分 経過`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [lastDoseTime]);

    return (
        <div className="timer-display">
            <h2>{elapsed}</h2>
            {lastDoseTime && (
                <p className="last-dose-label">
                    最終服用: {new Date(lastDoseTime).toLocaleString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
            )}
        </div>
    );
}
