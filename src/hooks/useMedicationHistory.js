import useLocalStorage from './useLocalStorage';
import { PRESET_MEDICATIONS } from '../constants/medications';
import { useEffect } from 'react';

export function useMedicationHistory() {
    // Medications list: [{ id, name, intervalHours, category, doseCount }]
    const [medications, setMedications] = useLocalStorage('medications', []);
    // History list: [{ id, medicationId, medicationName, timestamp }]
    const [history, setHistory] = useLocalStorage('medication-history-v2', []);

    // Retention settings: months to keep history (0 = infinite)
    const [retentionMonths, setRetentionMonths] = useLocalStorage('history-retention-months', 3);

    // Auto-cleanup on mount (or when retention setting changes)
    useEffect(() => {
        if (retentionMonths > 0 && history.length > 0) {
            const cutoffDate = new Date();
            cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);

            // Check if there are any old entries to remove
            const hasOldEntries = history.some(entry => new Date(entry.timestamp) < cutoffDate);

            if (hasOldEntries) {
                console.log(`Running auto-cleanup: removing entries older than ${retentionMonths} months`);
                setHistory(prev => prev.filter(entry => new Date(entry.timestamp) >= cutoffDate));
            }
        }
    }, [retentionMonths, history, setHistory]);

    // Initialize presets
    useEffect(() => {
        let updatedMedications = [...medications];
        let hasChanges = false;

        PRESET_MEDICATIONS.forEach((preset, index) => {
            const presetId = `preset-${index}`;
            const exists = updatedMedications.some(m => m.id === presetId);

            if (!exists) {
                updatedMedications.push({
                    id: presetId,
                    ...preset,
                    doseCount: 0
                });
                hasChanges = true;
            } else {
                // Update category if changed (e.g. Buscopan)
                const medIndex = updatedMedications.findIndex(m => m.id === presetId);
                if (updatedMedications[medIndex].category !== preset.category) {
                    updatedMedications[medIndex] = {
                        ...updatedMedications[medIndex],
                        category: preset.category
                    };
                    hasChanges = true;
                }
            }
        });

        if (hasChanges) {
            // Sort to keep presets at the top
            updatedMedications.sort((a, b) => {
                const aIsPreset = a.id.startsWith('preset-');
                const bIsPreset = b.id.startsWith('preset-');
                if (aIsPreset && !bIsPreset) return -1;
                if (!aIsPreset && bIsPreset) return 1;
                return 0;
            });
            setMedications(updatedMedications);
        }
    }, [medications, setMedications]);

    // Backfill history with medication names
    useEffect(() => {
        if (history.length === 0 || medications.length === 0) return;

        const updatedHistory = history.map(entry => {
            if (!entry.medicationName) {
                const med = medications.find(m => m.id === entry.medicationId);
                if (med) {
                    return { ...entry, medicationName: med.name };
                }
            }
            return entry;
        });

        // Check if any changes were made to avoid infinite loop
        const hasChanges = JSON.stringify(updatedHistory) !== JSON.stringify(history);
        if (hasChanges) {
            setHistory(updatedHistory);
        }
    }, [medications, history, setHistory]);

    const addDose = (medicationId) => {
        const now = new Date().toISOString();
        const med = medications.find(m => m.id === medicationId);
        const newEntry = {
            id: Date.now().toString(),
            medicationId,
            medicationName: med ? med.name : '不明な薬',
            timestamp: now
        };
        setHistory((prevHistory) => [newEntry, ...prevHistory]);

        // Increment dose count
        setMedications(medications.map(med =>
            med.id === medicationId
                ? { ...med, doseCount: (med.doseCount || 0) + 1 }
                : med
        ));
    };

    const removeDose = (entryId) => {
        setHistory((prevHistory) => prevHistory.filter((entry) => entry.id !== entryId));
    };

    const getLastDose = (medicationId) => {
        const medHistory = history.filter(h => h.medicationId === medicationId);
        return medHistory.length > 0 ? medHistory[0] : null;
    };

    const getHistoryForMedication = (medicationId) => {
        return history.filter(h => h.medicationId === medicationId);
    };

    const getLastDoseForCategory = (category) => {
        // Find all medications in this category
        const categoryMedIds = medications
            .filter(m => m.category === category)
            .map(m => m.id);

        // Find the most recent history entry for any of these medications
        const categoryHistory = history
            .filter(h => categoryMedIds.includes(h.medicationId))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return categoryHistory.length > 0 ? categoryHistory[0] : null;
    };

    const addMedication = (name, intervalHours, category = 'その他') => {
        const newMed = {
            id: Date.now().toString(),
            name,
            intervalHours: Number(intervalHours),
            category,
            doseCount: 0
        };
        setMedications([...medications, newMed]);
    };

    const removeMedication = (id) => {
        setMedications(medications.filter(m => m.id !== id));
    };

    const resetDoseCount = (medicationId) => {
        setMedications(medications.map(med =>
            med.id === medicationId
                ? { ...med, doseCount: 0 }
                : med
        ));
    };

    const exportData = () => {
        const data = {
            medications,
            history,
            version: '1.0',
            exportedAt: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    };

    const importData = (jsonString, mode = 'merge') => {
        try {
            const data = JSON.parse(jsonString);
            if (!data.medications || !data.history) {
                throw new Error('無効なデータ形式です。medicationsまたはhistoryが含まれていません。');
            }

            if (mode === 'overwrite') {
                setMedications(data.medications);
                setHistory(data.history);
            } else {
                // Merge mode: Add items that don't exist (by ID)
                const currentMedIds = new Set(medications.map(m => m.id));
                const newMeds = data.medications.filter(m => !currentMedIds.has(m.id));

                const currentHistoryIds = new Set(history.map(h => h.id));
                const newHistory = data.history.filter(h => !currentHistoryIds.has(h.id));

                setMedications([...medications, ...newMeds]);
                setHistory([...newHistory, ...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
            }
            return { success: true };
        } catch (error) {
            console.error('Import failed:', error);
            return { success: false, error: error.message };
        }
    };

    const clearOldHistory = (monthsToKeep = 12) => {
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);

        setHistory(prev => prev.filter(entry => new Date(entry.timestamp) >= cutoffDate));
    };

    return {
        medications,
        setMedications,
        history,
        setHistory,
        retentionMonths,
        setRetentionMonths,
        addDose,
        removeDose,
        getLastDose,
        getHistoryForMedication,
        getLastDoseForCategory,
        addMedication,
        removeMedication,
        resetDoseCount,
        exportData,
        importData,
        clearOldHistory
    };
}
