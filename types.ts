
export interface Point {
  x: number;
  y: number;
}

export type WheelStatus = 'ok' | 'warn' | 'alert';

export interface WheelData {
  id: number;
  wobbleMm: number;
  status: WheelStatus;
  path: Point[];
  center: Point | null;
  avgRadius: number;
}

export interface Tracker {
  id: number;
  path: Point[];
  lastSeen: number;
}

export interface Settings {
  brightnessThreshold: number;
  wobbleToleranceMm: number;
  pixelsPerMm: number;
  maxWheels: number;
  historyLength: number;
}
