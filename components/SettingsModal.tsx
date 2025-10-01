
import React, { useState } from 'react';
import { Settings } from '../types';
import { XIcon } from './Icons';

interface SettingsModalProps {
  settings: Settings;
  onClose: () => void;
  onSave: (settings: Settings) => void;
}

const SettingsInput: React.FC<{label: string, id: keyof Settings, value: number, onChange: (id: keyof Settings, value: number) => void, step: number, help: string}> = ({label, id, value, onChange, step, help}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-brand-text">{label}</label>
        <input
            type="number"
            id={id}
            value={value}
            onChange={(e) => onChange(id, parseFloat(e.target.value))}
            step={step}
            className="mt-1 block w-full bg-brand-primary border border-brand-border rounded-md shadow-sm py-2 px-3 text-brand-text focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
        />
        <p className="mt-1 text-xs text-brand-text-secondary">{help}</p>
    </div>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onClose, onSave }) => {
  const [currentSettings, setCurrentSettings] = useState<Settings>(settings);

  const handleChange = (id: keyof Settings, value: number) => {
    setCurrentSettings(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSave = () => {
    onSave(currentSettings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-brand-secondary rounded-lg shadow-xl w-full max-w-md border border-brand-border m-4">
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-lg font-semibold text-brand-text">Settings</h2>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text">
            <XIcon />
          </button>
        </div>
        <div className="p-6 space-y-4">
            <SettingsInput label="Brightness Threshold" id="brightnessThreshold" value={currentSettings.brightnessThreshold} onChange={handleChange} step={1} help="Value (0-255) to identify reflective tape. Higher is stricter."/>
            <SettingsInput label="Wobble Tolerance (mm)" id="wobbleToleranceMm" value={currentSettings.wobbleToleranceMm} onChange={handleChange} step={0.1} help="Wobble amount in millimeters to trigger an alert."/>
            <SettingsInput label="Pixels per Millimeter" id="pixelsPerMm" value={currentSettings.pixelsPerMm} onChange={handleChange} step={0.1} help="Calibration value. Measure a known length in pixels."/>
            <SettingsInput label="Max Wheels to Track" id="maxWheels" value={currentSettings.maxWheels} onChange={handleChange} step={1} help="The maximum number of wheels to track simultaneously."/>
            <SettingsInput label="Tracking History Length" id="historyLength" value={currentSettings.historyLength} onChange={handleChange} step={10} help="Number of frames to store for calculating wobble."/>
        </div>
        <div className="flex justify-end p-4 bg-brand-primary rounded-b-lg">
          <button onClick={handleSave} className="bg-brand-accent hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
