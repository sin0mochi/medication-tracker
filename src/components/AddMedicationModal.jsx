import { useState } from 'react';

export default function AddMedicationModal({ onClose, onAdd }) {
    const [name, setName] = useState('');
    const [interval, setInterval] = useState('4');
    const [category, setCategory] = useState('その他');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name) return;
        onAdd(name, Number(interval), category);
        onClose();
    };

    const categories = ['解熱鎮痛剤', '胃腸薬', '整腸剤', '風邪薬', 'アレルギー薬', 'サプリメント', 'その他'];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>新しい薬を追加</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="add-med-form">
                    <div className="form-group">
                        <label>薬の名前</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="例: ロキソニン"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>カテゴリ</label>
                        <select value={category} onChange={e => setCategory(e.target.value)}>
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>服用間隔（時間）</label>
                        <input
                            type="number"
                            value={interval}
                            onChange={e => setInterval(e.target.value)}
                            min="1"
                            max="24"
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn">追加する</button>
                </form>
            </div>
        </div>
    );
}
