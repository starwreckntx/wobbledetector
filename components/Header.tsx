
import React from 'react';
import { CameraIcon, CogIcon, LogoIcon, PowerIcon } from './Icons';

interface HeaderProps {
  onToggleCamera: () => void;
  isCameraOn: boolean;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleCamera, isCameraOn, onOpenSettings }) => {
  return (
    <header className="bg-brand-secondary border-b border-brand-border p-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-3">
        <LogoIcon />
        <h1 className="text-xl font-bold text-brand-text">Centrifuge Wobble Detector</h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleCamera}
          className={`px-4 py-2 rounded-md flex items-center gap-2 font-semibold transition-all duration-200 ease-in-out
            ${isCameraOn ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
        >
          {isCameraOn ? <PowerIcon /> : <CameraIcon />}
          <span>{isCameraOn ? 'Stop Camera' : 'Start Camera'}</span>
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-md hover:bg-brand-border transition-colors"
          aria-label="Open settings"
        >
          <CogIcon />
        </button>
      </div>
    </header>
  );
};
