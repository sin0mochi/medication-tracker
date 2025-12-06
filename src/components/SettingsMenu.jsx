import React, { useEffect, useRef, useState } from 'react';

export default function SettingsMenu({
    isOpen,
    onClose,
    onShowHistory,
    layoutMode,
    onToggleLayout,
    theme,
    onToggleTheme,
    onOpenAddModal,
    retentionMonths,
    onRetentionChange,
    onClearHistory
}) {
    const menuRef = useRef(null);
    const [clearMonths, setClearMonths] = useState(3);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleClearHistory = () => {
        onClearHistory(clearMonths);
    };

    return (
        <div className="settings-menu-overlay">
            <div className="settings-menu" ref={menuRef}>
                <div className="settings-menu-header">
                    <h3>設定</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="settings-menu-content">
                    <button className="settings-item" onClick={() => { onShowHistory(); onClose(); }}>
                        <span className="icon">📅</span>
                        <span className="label">全体履歴</span>
                    </button>

                    <div className="settings-item-row">
                        <span className="label">表示モード</span>
                        <button className="toggle-btn" onClick={onToggleLayout}>
                            {layoutMode === 'grid' ? '2列 (グリッド)' : '1列 (リスト)'}
                        </button>
                    </div>

                    <div className="settings-item-row">
                        <span className="label">テーマ</span>
                        <button className="toggle-btn" onClick={onToggleTheme}>
                            {theme === 'light' ? 'ライト' : 'ダーク'}
                        </button>
                    </div>

                    <hr className="divider-sub" style={{ width: '100%', margin: '0.5rem 0', opacity: 0.3 }} />

                    <button className="settings-item" onClick={() => { onOpenAddModal(); onClose(); }}>
                        <span className="icon">💊</span>
                        <span className="label">新しい薬を追加</span>
                    </button>

                    <hr className="divider-sub" style={{ width: '100%', margin: '0.5rem 0', opacity: 0.3 }} />

                    <div className="settings-section">
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.8 }}>🗑️ データ削除設定</h4>

                        <div className="setting-group" style={{ marginBottom: '1rem' }}>
                            <p className="description" style={{ fontSize: '0.8rem', margin: '0 0 0.3rem 0', opacity: 0.7 }}>自動削除期間</p>
                            <select
                                value={retentionMonths}
                                onChange={(e) => onRetentionChange(Number(e.target.value))}
                                className="month-select"
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--md-sys-color-outline-variant)', background: 'var(--md-sys-color-surface-container)', color: 'var(--md-sys-color-on-surface)' }}
                            >
                                <option value={0}>自動削除しない</option>
                                <option value={3}>3ヶ月経過で削除</option>
                                <option value={6}>6ヶ月経過で削除</option>
                                <option value={12}>1年経過で削除</option>
                                <option value={24}>2年経過で削除</option>
                            </select>
                        </div>

                        <div className="setting-group">
                            <p className="description" style={{ fontSize: '0.8rem', margin: '0 0 0.3rem 0', opacity: 0.7 }}>手動削除</p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    value={clearMonths}
                                    onChange={(e) => setClearMonths(Number(e.target.value))}
                                    className="month-select"
                                    style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--md-sys-color-outline-variant)', background: 'var(--md-sys-color-surface-container)', color: 'var(--md-sys-color-on-surface)' }}
                                >
                                    <option value={3}>3ヶ月以上前</option>
                                    <option value={6}>6ヶ月以上前</option>
                                    <option value={12}>1年以上前</option>
                                    <option value={24}>2年以上前</option>
                                </select>
                                <button
                                    className="action-btn danger"
                                    onClick={handleClearHistory}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'var(--md-sys-color-error)',
                                        color: 'var(--md-sys-color-on-error)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    削除
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-footer" style={{ marginTop: '1rem', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
                    Version 1.1.0
                </div>
            </div>


        </div>
    );
}
