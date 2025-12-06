import { useState, useEffect, useRef } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { useMedicationHistory } from './hooks/useMedicationHistory';
import MedicationCard from './components/MedicationCard';
import HistoryList from './components/HistoryList';
import HistoryModal from './components/HistoryModal';
import AddMedicationModal from './components/AddMedicationModal';
import DataManagementModal from './components/DataManagementModal';
import SettingsMenu from './components/SettingsMenu';
import ConfirmModal from './components/ConfirmModal';

function App() {
  const {
    medications,
    history,
    addDose,
    removeDose,
    getLastDose,
    getLastDoseForCategory,
    getHistoryForMedication,
    addMedication,
    removeMedication,
    resetDoseCount,
    resetAllDoseCounts,
    exportData,
    importData,
    clearOldHistory,
    retentionMonths,
    setRetentionMonths,
    updateDose
  } = useMedicationHistory();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showGlobalHistory, setShowGlobalHistory] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Confirm Modal State for Global Reset
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => { },
    isDanger: false,
    confirmText: 'OK'
  });

  // Theme state
  const [theme, setTheme] = useLocalStorage('app-theme', 'dark'); // 'dark' or 'warm'

  // Layout state
  const [layoutMode, setLayoutMode] = useLocalStorage('app-layout-mode', 'grid'); // 'grid' or 'list'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleResetAllClick = () => {
    setConfirmConfig({
      title: '一括リセット',
      message: 'すべての薬の服用回数をリセットしますか？\n（新しい日の始まりに便利です）',
      onConfirm: () => resetAllDoseCounts(),
      isDanger: false,
      confirmText: 'リセット'
    });
    setShowConfirmModal(true);
  };

  // Long press logic for reset
  const [pressTimer, setPressTimer] = useState(null);
  const isLongPress = useRef(false);
  const ignoreClick = useRef(false);

  const handleResetDown = () => {
    isLongPress.current = false;
    ignoreClick.current = false;
    const timer = setTimeout(() => {
      isLongPress.current = true;
      ignoreClick.current = true; // Ignore the subsequent click event
      resetAllDoseCounts();
      // Visual feedback
      if (navigator.vibrate) navigator.vibrate(50);
    }, 800); // 0.8 second long press
    setPressTimer(timer);
  };

  const handleResetUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleResetLeave = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleResetClick = (e) => {
    if (ignoreClick.current) {
      ignoreClick.current = false;
      return;
    }
    handleResetAllClick();
  };

  const handleManualDelete = (months) => {
    setShowSettingsMenu(false);
    setConfirmConfig({
      title: 'データの削除',
      message: `${months}ヶ月以上前の履歴を削除しますか？\nこの操作は取り消せません。`,
      onConfirm: () => {
        const count = clearOldHistory(months);
        setTimeout(() => {
          if (count > 0) {
            alert(`${count}件の履歴を削除しました。`);
          } else {
            alert('削除対象の履歴はありませんでした。');
          }
        }, 300);
      },
      isDanger: true,
      confirmText: '削除'
    });
    setShowConfirmModal(true);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>お薬ノート</h1>
        <div className="header-actions-main" style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`header-icon-btn ${pressTimer ? 'is-pressing' : ''}`}
            onMouseDown={handleResetDown}
            onMouseUp={handleResetUp}
            onMouseLeave={handleResetLeave}
            onTouchStart={handleResetDown}
            onTouchEnd={handleResetUp}
            onClick={handleResetClick}
            title="一括リセット（長押しで即リセット）"
            style={{ fontSize: '1.2rem', cursor: 'pointer', userSelect: 'none' }}
          >
            🔄
          </button>
          <button
            className="header-icon-btn"
            onClick={() => setShowSettingsMenu(true)}
            title="設定"
            style={{ fontSize: '1.2rem' }}
          >
            ⚙️
          </button>
        </div>
      </header>

      <main>
        <div className={`medication-grid ${layoutMode === 'list' ? 'one-column' : ''}`}>
          {medications.map(med => (
            <MedicationCard
              key={`${med.id}-${getLastDose(med.id)?.id || 'none'}`}
              medication={med}
              lastDose={getLastDose(med.id)}
              lastCategoryDose={getLastDoseForCategory(med.category)}
              onRecord={addDose}
              onReset={resetDoseCount}
              onDelete={removeMedication}
              onShowHistory={(med) => setSelectedMedication(med)}
            />
          ))}
        </div>
      </main>

      {showAddModal && (
        <AddMedicationModal
          onClose={() => setShowAddModal(false)}
          onAdd={addMedication}
        />
      )}

      {(selectedMedication || showGlobalHistory) && (
        <HistoryModal
          medication={selectedMedication} // null if global history
          history={selectedMedication ? getHistoryForMedication(selectedMedication.id) : history}
          medications={medications} // Pass medications list for name lookup
          onClose={() => {
            setSelectedMedication(null);
            setShowGlobalHistory(false);
          }}
          onDeleteHistory={removeDose}
          onUpdateHistory={updateDose}
        />
      )}

      <DataManagementModal
        isOpen={showDataModal}
        onClose={() => setShowDataModal(false)}
        onClearHistory={clearOldHistory}
        retentionMonths={retentionMonths}
        onRetentionChange={setRetentionMonths}
        onOpenAddModal={() => {
          setShowDataModal(false);
          setShowAddModal(true);
        }}
        currentTheme={theme}
        onThemeChange={setTheme}
      />

      <SettingsMenu
        isOpen={showSettingsMenu}
        onClose={() => setShowSettingsMenu(false)}
        onShowHistory={() => setShowGlobalHistory(true)}
        layoutMode={layoutMode}
        onToggleLayout={() => setLayoutMode(layoutMode === 'grid' ? 'list' : 'grid')}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'warm' : 'dark')}
        onOpenAddModal={() => setShowAddModal(true)}
        retentionMonths={retentionMonths}
        onRetentionChange={setRetentionMonths}
        onClearHistory={handleManualDelete}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        {...confirmConfig}
      />
    </div>
  );
}

export default App;
