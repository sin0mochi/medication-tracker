import { useState } from 'react';

export default function DataManagementModal({ isOpen, onClose, onClearHistory, retentionMonths, onRetentionChange, onOpenAddModal, currentTheme, onThemeChange }) {
    const [clearMonths, setClearMonths] = useState(3);

    if (!isOpen) return null;

    const handleClearHistory = () => {
        if (window.confirm(`${clearMonths}ヶ月以上前の履歴を削除しますか？\nこの操作は取り消せません。`)) {
            onClearHistory(clearMonths);
            alert('古い履歴を削除しました。');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>⚙️ 設定</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <section className="data-section">
                        <h3>🎨 デザイン設定</h3>
                        <div className="theme-selection">
                            <label className="theme-option">
                                <input
                                    type="radio"
                                    name="theme"
                                    value="dark"
                                    checked={currentTheme === 'dark'}
                                    onChange={(e) => onThemeChange(e.target.value)}
                                />
                                <div className="theme-card">
                                    <span className="theme-preview">🌙</span>
                                    <span>ダーク</span>
                                </div>
                            </label>
                            <label className="theme-option">
                                <input
                                    type="radio"
                                    name="theme"
                                    value="warm"
                                    checked={currentTheme === 'warm'}
                                    onChange={(e) => onThemeChange(e.target.value)}
                                />
                                <div className="theme-card">
                                    <span className="theme-preview">✏️</span>
                                    <span>手書き</span>
                                </div>
                            </label>
                        </div>
                    </section>

                    <hr className="divider" />

                    <section className="data-section">
                        <h3>💊 薬の管理</h3>
                        <button className="action-btn primary" onClick={onOpenAddModal}>
                            新しい薬を追加
                        </button>
                    </section>

                    <hr className="divider" />

                    <section className="data-section danger">
                        <h3>🗑️ データ削除設定</h3>

                        <div className="setting-group" style={{ marginBottom: '1rem' }}>
                            <p className="description">指定した期間より古いデータを自動的に削除します。</p>
                            <select
                                value={retentionMonths}
                                onChange={(e) => onRetentionChange(Number(e.target.value))}
                                className="month-select"
                                style={{ width: '100%' }}
                            >
                                <option value={0}>自動削除しない</option>
                                <option value={3}>3ヶ月経過で削除</option>
                                <option value={6}>6ヶ月経過で削除</option>
                                <option value={12}>1年経過で削除</option>
                                <option value={24}>2年経過で削除</option>
                            </select>
                        </div>

                        <hr className="divider-sub" />

                        <p className="description">手動で古いデータを削除することもできます。</p>
                        <div className="control-row">
                            <select
                                value={clearMonths}
                                onChange={(e) => setClearMonths(Number(e.target.value))}
                                className="month-select"
                            >
                                <option value={3}>3ヶ月以上前</option>
                                <option value={6}>6ヶ月以上前</option>
                                <option value={12}>1年以上前</option>
                                <option value={24}>2年以上前</option>
                            </select>
                            <button className="action-btn danger" onClick={handleClearHistory}>
                                今すぐ削除
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
