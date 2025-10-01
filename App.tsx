
import React, { useState, useCallback } from 'react';
import { CameraFeed } from './components/CameraFeed';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { Settings, WheelData } from './types';
import { getWobbleDiagnosis } from './services/geminiService';
import { Toast } from './components/Toast';
import { GeminiIcon } from './components/Icons';

export default function App() {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [wheelData, setWheelData] = useState<WheelData[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    brightnessThreshold: 220,
    wobbleToleranceMm: 1.5,
    pixelsPerMm: 3.0,
    maxWheels: 3,
    historyLength: 50,
  });

  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [geminiDiagnosis, setGeminiDiagnosis] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDataUpdate = useCallback((data: WheelData[]) => {
    setWheelData(data);
  }, []);

  const handleToggleCamera = () => {
    setIsCameraOn(prev => !prev);
    if (isCameraOn) {
      // Reset data when turning off
      setWheelData([]);
    }
  };

  const handleDiagnose = async () => {
    if (!wheelData.length) {
      setError("No wheel data available to diagnose.");
      return;
    }
    setIsLoadingGemini(true);
    setError(null);
    setGeminiDiagnosis('');
    try {
      const diagnosis = await getWobbleDiagnosis(wheelData, settings);
      setGeminiDiagnosis(diagnosis);
    } catch (err) {
      console.error("Gemini diagnosis failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while contacting the AI.");
    } finally {
      setIsLoadingGemini(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-primary text-brand-text font-sans flex flex-col">
      <Header 
        onToggleCamera={handleToggleCamera} 
        isCameraOn={isCameraOn} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
      />
      <main className="flex-grow flex flex-col lg:flex-row p-4 gap-4">
        <div className="flex-grow lg:w-2/3 xl:w-3/4 bg-brand-secondary rounded-lg shadow-lg overflow-hidden border border-brand-border">
          <CameraFeed 
            isCameraOn={isCameraOn}
            onDataUpdate={handleDataUpdate}
            settings={settings}
          />
        </div>
        <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4">
          <Dashboard
            wheelData={wheelData}
            onDiagnoseClick={handleDiagnose}
            isLoading={isLoadingGemini}
            maxWheels={settings.maxWheels}
          />
          {(geminiDiagnosis || isLoadingGemini) && (
            <div className="bg-brand-secondary p-4 rounded-lg shadow-lg border border-brand-border animate-fade-in">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-brand-accent">
                    <GeminiIcon />
                    AI Diagnosis
                </h3>
                {isLoadingGemini && <p className="text-brand-text-secondary animate-pulse">Analyzing wobble data...</p>}
                {geminiDiagnosis && <p className="text-sm whitespace-pre-wrap">{geminiDiagnosis}</p>}
            </div>
          )}
        </div>
      </main>
      
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onClose={() => setIsSettingsOpen(false)}
          onSave={(newSettings) => {
            setSettings(newSettings);
            setIsSettingsOpen(false);
          }}
        />
      )}

      {error && <Toast message={error} type="error" onDismiss={() => setError(null)} />}
    </div>
  );
}
