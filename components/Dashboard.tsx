
import React from 'react';
import { WheelData } from '../types';
import { GeminiIcon, StatusOkIcon, StatusWarnIcon, StatusAlertIcon } from './Icons';

interface WheelStatusCardProps {
  data: WheelData;
}

const WheelStatusCard: React.FC<WheelStatusCardProps> = ({ data }) => {
  const statusConfig = {
    ok: {
      Icon: StatusOkIcon,
      bgColor: 'bg-status-ok/10',
      borderColor: 'border-status-ok',
      textColor: 'text-status-ok',
      text: 'Stable',
    },
    warn: {
      Icon: StatusWarnIcon,
      bgColor: 'bg-status-warn/10',
      borderColor: 'border-status-warn',
      textColor: 'text-status-warn',
      text: 'Warning',
    },
    alert: {
      Icon: StatusAlertIcon,
      bgColor: 'bg-status-alert/10',
      borderColor: 'border-status-alert',
      textColor: 'text-status-alert',
      text: 'Alert',
    },
  };
  
  const config = statusConfig[data.status];

  return (
    <div className={`p-4 rounded-lg border-l-4 ${config.borderColor} ${config.bgColor} shadow-sm transition-all duration-300`}>
      <div className="flex justify-between items-center">
        <span className="font-bold text-brand-text">Wheel {data.id}</span>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${config.textColor} ${config.bgColor}`}>
          <config.Icon />
          <span>{config.text}</span>
        </div>
      </div>
      <div className="mt-2 text-2xl font-mono text-brand-text">
        {data.wobbleMm.toFixed(2)} <span className="text-sm font-sans text-brand-text-secondary">mm</span>
      </div>
      <p className="text-xs text-brand-text-secondary">Wobble Deviation</p>
    </div>
  );
};

interface DashboardProps {
  wheelData: WheelData[];
  onDiagnoseClick: () => void;
  isLoading: boolean;
  maxWheels: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ wheelData, onDiagnoseClick, isLoading, maxWheels }) => {
  
    const displayedWheels = Array.from({ length: maxWheels }, (_, i) => {
        const data = wheelData.find(w => w.id === i + 1);
        return data ? <WheelStatusCard key={i+1} data={data} /> : (
            <div key={i+1} className="p-4 rounded-lg border border-dashed border-brand-border bg-brand-secondary/50 flex flex-col justify-center items-center">
                <span className="font-bold text-brand-text-secondary">Wheel {i+1}</span>
                <span className="text-sm text-brand-text-secondary/70">Awaiting detection...</span>
            </div>
        );
    });

  return (
    <div className="bg-brand-secondary p-4 rounded-lg shadow-lg border border-brand-border flex flex-col gap-4">
      <h2 className="text-xl font-semibold border-b border-brand-border pb-2">Live Status</h2>
      <div className="flex flex-col gap-3">
        {displayedWheels}
      </div>
      <button
        onClick={onDiagnoseClick}
        disabled={isLoading || wheelData.length === 0}
        className="mt-4 w-full bg-brand-accent hover:bg-blue-500 disabled:bg-brand-border disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-all duration-200"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <GeminiIcon />
            <span>Get AI Diagnosis</span>
          </>
        )}
      </button>
    </div>
  );
};
