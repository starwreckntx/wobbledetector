
import React, { useRef, useEffect, useCallback } from 'react';
import { Point, Settings, Tracker, WheelData, WheelStatus } from '../types';
import { CameraIcon } from './Icons';

interface CameraFeedProps {
  isCameraOn: boolean;
  settings: Settings;
  onDataUpdate: (data: WheelData[]) => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ isCameraOn, settings, onDataUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const trackers = useRef<Tracker[]>([]);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animationFrameId.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Draw video frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const { brightnessThreshold } = settings;

    // --- Blob Detection ---
    const brightPixels: Point[] = [];
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness > brightnessThreshold) {
        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);
        brightPixels.push({ x, y });
      }
    }

    const detectedSpots: Point[] = [];
    const visited = new Set<string>();

    for(const pixel of brightPixels) {
      const key = `${pixel.x},${pixel.y}`;
      if(visited.has(key)) continue;

      const blob: Point[] = [];
      const queue: Point[] = [pixel];
      visited.add(key);

      while(queue.length > 0) {
        const current = queue.shift()!;
        blob.push(current);
        // Simplified neighbor search
        for(let dx = -5; dx <= 5; dx++) {
          for(let dy = -5; dy <= 5; dy++) {
            const neighbor = {x: current.x + dx, y: current.y + dy};
            const neighborKey = `${neighbor.x},${neighbor.y}`;
            if(brightPixels.some(p => p.x === neighbor.x && p.y === neighbor.y) && !visited.has(neighborKey)) {
              visited.add(neighborKey);
              queue.push(neighbor);
            }
          }
        }
      }
      
      if (blob.length > 5) { // Filter small noise
        const centroid = blob.reduce((acc, p) => ({x: acc.x + p.x, y: acc.y + p.y}), {x:0, y:0});
        centroid.x /= blob.length;
        centroid.y /= blob.length;
        detectedSpots.push(centroid);
      }
    }

    // --- Tracking ---
    const now = Date.now();
    const updatedTrackers: Tracker[] = [];

    detectedSpots.forEach(spot => {
      let closestTracker: Tracker | null = null;
      let minDistance = Infinity;

      trackers.current.forEach(tracker => {
        const lastPos = tracker.path[tracker.path.length - 1];
        const distance = Math.hypot(spot.x - lastPos.x, spot.y - lastPos.y);
        if (distance < minDistance && distance < 100) { // Max distance threshold
          minDistance = distance;
          closestTracker = tracker;
        }
      });
      
      if (closestTracker) {
        closestTracker.path.push(spot);
        if (closestTracker.path.length > settings.historyLength) {
          closestTracker.path.shift();
        }
        closestTracker.lastSeen = now;
        updatedTrackers.push(closestTracker);
      } else if (trackers.current.length + updatedTrackers.length < settings.maxWheels) {
        updatedTrackers.push({ id: trackers.current.length + updatedTrackers.length + 1, path: [spot], lastSeen: now });
      }
    });
    
    // Add un-updated but still valid trackers
    trackers.current.forEach(t => {
      if(!updatedTrackers.find(ut => ut.id === t.id) && (now - t.lastSeen < 1000)) {
        updatedTrackers.push(t);
      }
    });
    
    trackers.current = updatedTrackers;

    // --- Wobble Calculation & Drawing ---
    const newWheelData: WheelData[] = [];
    trackers.current.forEach(tracker => {
      ctx.beginPath();
      ctx.strokeStyle = '#58A6FF';
      ctx.lineWidth = 2;
      if (tracker.path.length > 1) {
        ctx.moveTo(tracker.path[0].x, tracker.path[0].y);
        for(let i = 1; i < tracker.path.length; i++) {
            ctx.lineTo(tracker.path[i].x, tracker.path[i].y);
        }
      }
      ctx.stroke();

      let wobbleMm = 0;
      let center: Point | null = null;
      let avgRadius = 0;

      if(tracker.path.length > 10) {
        center = tracker.path.reduce((acc, p) => ({x: acc.x + p.x, y: acc.y + p.y}), {x:0, y:0});
        center.x /= tracker.path.length;
        center.y /= tracker.path.length;
        
        const radii = tracker.path.map(p => Math.hypot(p.x - center!.x, p.y - center!.y));
        avgRadius = radii.reduce((a, b) => a + b, 0) / radii.length;
        const wobblePx = Math.max(...radii) - Math.min(...radii);
        wobbleMm = wobblePx / settings.pixelsPerMm;

        // Draw center and circle
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 215, 0, 0.8)";
        ctx.arc(center.x, center.y, 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
        ctx.arc(center.x, center.y, avgRadius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      const status: WheelStatus = wobbleMm > settings.wobbleToleranceMm ? 'alert' : (wobbleMm > settings.wobbleToleranceMm * 0.6 ? 'warn' : 'ok');

      // Draw current spot
      ctx.beginPath();
      ctx.fillStyle = status === 'alert' ? '#DA3633' : status === 'warn' ? '#D29922' : '#238636';
      ctx.arc(tracker.path[tracker.path.length-1].x, tracker.path[tracker.path.length-1].y, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(tracker.id.toString(), tracker.path[tracker.path.length-1].x, tracker.path[tracker.path.length-1].y + 5);

      newWheelData.push({ id: tracker.id, wobbleMm, status, path: tracker.path, center, avgRadius });
    });
    
    onDataUpdate(newWheelData);
    animationFrameId.current = requestAnimationFrame(processFrame);
  }, [settings, onDataUpdate]);

  useEffect(() => {
    if (isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 1280, height: 720 } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            animationFrameId.current = requestAnimationFrame(processFrame);
          }
        })
        .catch(err => {
          console.error("Error accessing camera:", err);
        });
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
        trackers.current = [];
        onDataUpdate([]);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraOn, processFrame]);

  return (
    <div className="w-full h-full relative bg-black flex justify-center items-center">
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
      {!isCameraOn && (
        <div className="absolute inset-0 flex flex-col justify-center items-center text-brand-text-secondary">
          <CameraIcon className="w-24 h-24 mb-4" />
          <p className="text-xl">Camera is off</p>
          <p>Click 'Start Camera' to begin monitoring.</p>
        </div>
      )}
    </div>
  );
};
