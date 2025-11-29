import { useState, useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { useMedicationHistory } from './hooks/useMedicationHistory';
import MedicationCard from './components/MedicationCard';
import HistoryList from './components/HistoryList';
import HistoryModal from './components/HistoryModal';
import AddMedicationModal from './components/AddMedicationModal';
import DataManagementModal from './components/DataManagementModal';

function App() {
  const {
    medications,
    history,
    addDose,
    removeDose,
    getLastDose,
    getHistoryForMedication,
    addMedication,
    removeMedication,
    resetDoseCount,
    exportData,
    importData,
    clearOldHistory,
    retentionMonths,
    setRetentionMonths
  } = useMedicationHistory();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showGlobalHistory, setShowGlobalHistory] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);

  // Theme state
  const [theme, setTheme] = useLocalStorage('app-theme', 'dark'); // 'dark' or 'warm'
  // const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>お薬ノート</h1>
        <div className="header-actions-main">
          <button
            className="history-global-btn"
            onClick={() => setShowGlobalHistory(true)}
            title="全体の履歴を表示"
          >
            📋
          </button>
          <button
            className="header-icon-btn"
            onClick={() => setShowDataModal(true)}
            title="設定"
            style={{ fontSize: '1.2rem' }}
          >
            ⚙️
          </button>
        </div>
      </header>

      <main>
        <div className="medication-grid">
          {medications.map(med => (
            <MedicationCard
              key={med.id}
              medication={med}
              lastDose={getLastDose(med.id)}
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
    </div>
  );
}

export default App;
