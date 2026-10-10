import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  CameraOff,
  SwitchCamera,
  Scan,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Upload,
  RefreshCw,
  Share2,
  Info,
  CheckCircle,
  Eye,
  Lock,
  Zap,
} from 'lucide-react';
import { ImageScanReport } from '../types';

interface CameraScannerProps {
  onShareReportToMobile: (report: {
    type: 'camera';
    summary: string;
    verdict: string;
    riskScore: number;
    target: string;
  }) => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onShareReportToMobile,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [permissionExplanationOpen, setPermissionExplanationOpen] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [report, setReport] = useState<ImageScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Stop video stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  const startCameraStream = async (desiredFacing: 'environment' | 'user' = facingMode) => {
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionState('unsupported');
      setError('Camera API is not supported on this device/browser.');
      return;
    }

    try {
      stopCameraStream();
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: desiredFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreamActive(true);
        setPermissionState('granted');
      }
    } catch (err: any) {
      console.warn('Camera access denied or failed:', err);
      setPermissionState('denied');
      setError(
        'Camera permission was denied or camera is unavailable. You can grant access in browser site settings or upload a screenshot below.'
      );
    }
  };

  const handleToggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (streamActive) {
      startCameraStream(nextFacing);
    }
  };

  // Capture current video frame
  const handleCaptureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      analyzeImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedImage(result);
      analyzeImage(result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Data: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scan-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: 'image/jpeg',
          scanContext: 'Real-time camera viewfinder threat analysis',
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.report) {
        setReport(data.report);
      } else {
        throw new Error('Invalid report payload');
      }
    } catch (err: any) {
      console.error('Visual analysis error:', err);
      setError('Unable to analyze image frame. Please verify connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictTheme = (threatLevel: string, score: number) => {
    if (threatLevel === 'CRITICAL' || threatLevel === 'HIGH' || score >= 70) {
      return {
        badgeBg: 'bg-rose-500/20 border-rose-500/50 text-rose-300',
        scoreColor: 'text-rose-400',
        barColor: 'bg-rose-500',
        glowColor: 'shadow-rose-950/80 border-rose-500/40',
        icon: <ShieldAlert className="w-8 h-8 text-rose-400" />,
        label: 'CRITICAL VISUAL THREAT DETECTED',
      };
    }
    if (threatLevel === 'MEDIUM' || score >= 40) {
      return {
        badgeBg: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
        scoreColor: 'text-amber-400',
        barColor: 'bg-amber-500',
        glowColor: 'shadow-amber-950/80 border-amber-500/40',
        icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
        label: 'SUSPICIOUS ARTIFACTS FOUND',
      };
    }
    return {
      badgeBg: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
      scoreColor: 'text-emerald-400',
      barColor: 'bg-emerald-500',
      glowColor: 'shadow-emerald-950/80 border-emerald-500/40',
      icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
      label: 'VISUAL PATTERN VERIFIED CLEAN',
    };
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Hidden Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono mb-3">
          <Camera className="w-3.5 h-3.5" />
          <span>Real-Time Visual Threat &amp; Camera Analyzer</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2">
          Transparent Real-Time Camera Scanner
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Point your phone or webcam at suspicious physical letters, screen texts, bank slips, or mystery QR codes. Live transparent HUD with instant neural inspection.
        </p>
      </div>

      {/* Camera Permission Transparency & Safety Explanation */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-lg shadow-cyan-950/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Camera Privacy &amp; Permission Transparency</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/40 font-semibold">
                  100% PRIVATE
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                RiskProtector operates under strict zero-retention principles. Read our transparent hardware access policy below:
              </p>
            </div>
          </div>

          <button
            onClick={() => setPermissionExplanationOpen(!permissionExplanationOpen)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
          >
            {permissionExplanationOpen ? 'Hide Policy' : 'Show Policy'}
          </button>
        </div>

        {permissionExplanationOpen && (
          <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>1. Purpose of Access</span>
              </div>
              <p className="text-[11px] text-slate-400">
                To capture and inspect suspicious physical documents, paper scams, QR codes, or text displayed on external screens.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>2. Zero Cloud Video Recording</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Your live camera stream never leaves your local browser memory. Only single user-triggered snapshots are analyzed by Gemini.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>3. One-Click Control</span>
              </div>
              <p className="text-[11px] text-slate-400">
                You can activate or permanently stop the camera feed at any moment. You can also upload a photo file without enabling the camera.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Viewfinder / Transparent HUD Container */}
      <div className="relative w-full max-w-3xl mx-auto bg-slate-950 border-2 border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-950/60 mb-6 min-h-[380px] sm:min-h-[460px] flex items-center justify-center">
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            streamActive ? 'opacity-90 block' : 'hidden'
          }`}
        />

        {/* Captured Snapshot Preview if stream stopped */}
        {!streamActive && capturedImage && (
          <img
            src={capturedImage}
            alt="Captured scan target"
            className="w-full h-full object-contain max-h-[460px]"
          />
        )}

        {/* Inactive Stream Placeholder Screen */}
        {!streamActive && !capturedImage && (
          <div className="p-8 text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center mb-4">
              <Camera className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Transparent Camera Viewfinder Inactive
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Start live transparent scanning to analyze physical scams, QR codes on letters, or text on screens in real time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => startCameraStream()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/60 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Start Camera Live Feed</span>
              </button>

              <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition flex items-center justify-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload Screenshot / Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Transparent Cyber HUD Overlay (Visible when stream is active) */}
        {streamActive && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 bg-cyan-950/10">
            {/* Top HUD Telemetry */}
            <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-black/60 rounded-md border border-cyan-500/30 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>TRANSPARENT HUD: ACTIVE</span>
              </div>
              <div className="px-2.5 py-1 bg-black/60 rounded-md border border-cyan-500/30 backdrop-blur-sm">
                FACING: {facingMode.toUpperCase()} | 1080p
              </div>
            </div>

            {/* Viewfinder Target Reticle */}
            <div className="relative mx-auto w-64 h-64 sm:w-80 sm:h-80 border border-cyan-400/40 rounded-2xl flex items-center justify-center">
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />

              {/* Animated Laser Scanning Line */}
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-laser" />

              {/* Center Crosshair */}
              <div className="w-8 h-8 border border-cyan-400/30 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              </div>

              <div className="absolute bottom-2 text-[10px] font-mono text-cyan-300/80 bg-black/50 px-2 py-0.5 rounded">
                ALIGN TEXT OR QR IN RETICLE
              </div>
            </div>

            {/* Bottom HUD bar */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="bg-black/60 px-2 py-1 rounded border border-slate-800">
                SENSOR: REAL-TIME FRAME
              </span>
              <span className="bg-black/60 px-2 py-1 rounded border border-slate-800">
                AI SCANNER: STANDBY
              </span>
            </div>
          </div>
        )}

        {/* Controls Overlay Bar (Active stream controls) */}
        {streamActive && (
          <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-3 z-20 px-4">
            <button
              onClick={handleCaptureFrame}
              disabled={isLoading}
              className="px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm shadow-2xl shadow-cyan-400/50 flex items-center gap-2 transition hover:scale-105 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Frame...</span>
                </>
              ) : (
                <>
                  <Scan className="w-5 h-5" />
                  <span>CAPTURE &amp; SCAN FRAME</span>
                </>
              )}
            </button>

            <button
              onClick={handleToggleFacingMode}
              className="p-3 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 transition cursor-pointer"
              title="Switch camera"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>

            <button
              onClick={stopCameraStream}
              className="p-3 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 transition cursor-pointer"
              title="Stop camera"
            >
              <CameraOff className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Alternative File Upload and Quick Samples */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-8">
        <div className="text-xs text-slate-300">
          <span className="font-semibold text-white block">
            Don't have a camera or analyzing a desktop screenshot?
          </span>
          <span className="text-slate-400">
            Upload any screenshot or photo directly for instant AI analysis.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!streamActive && (
            <button
              onClick={() => startCameraStream()}
              className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Turn On Camera</span>
            </button>
          )}

          <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Visual Threat Report */}
      {report && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-fade-in">
          {/* Header */}
          {(() => {
            const theme = getVerdictTheme(report.threatLevel, report.riskScore);
            return (
              <div
                className={`p-5 rounded-xl border ${theme.glowColor} bg-slate-950/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    {theme.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}>
                        LEVEL: {report.threatLevel}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Visual Threat Risk
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      {theme.label}
                    </h2>
                    <p className="text-xs text-rose-300 font-mono mt-0.5 font-bold">
                      {report.immediateWarning}
                    </p>
                  </div>
                </div>

                <div className="w-full md:w-auto flex md:flex-col items-center justify-between md:items-end gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
                      Visual Threat Risk
                    </span>
                    <span className={`text-3xl font-black ${theme.scoreColor}`}>
                      {report.riskScore}%
                    </span>
                  </div>
                  <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${theme.barColor} transition-all duration-1000`}
                      style={{ width: `${Math.min(100, Math.max(5, report.riskScore))}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Analysis description */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-300">
            <h3 className="text-xs font-mono uppercase text-slate-400 mb-1 flex items-center gap-1.5 font-bold">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Visual Analysis Findings
            </h3>
            <p>{report.analysis}</p>
          </div>

          {/* Extracted Text OCR */}
          {report.textExtracted && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="text-xs font-mono text-cyan-400 font-bold uppercase mb-2">
                Optical Character Recognition (OCR) Extracted Text:
              </h4>
              <p className="text-xs text-slate-300 font-mono bg-slate-900 p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                {report.textExtracted}
              </p>
            </div>
          )}

          {/* Detected Artifacts */}
          {report.detectedArtifacts?.length > 0 && (
            <div>
              <h4 className="text-xs font-mono text-slate-400 uppercase font-bold mb-2">
                Identified Visual Artifacts &amp; Markers:
              </h4>
              <div className="flex flex-wrap gap-2">
                {report.detectedArtifacts.map((art, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 border border-rose-500/30 text-rose-300 flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>{art}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Safe Actions */}
          {report.safeActions?.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Recommended Defensive Protocols
              </h4>
              <ul className="space-y-1 text-xs text-slate-300">
                {report.safeActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mobile Sharing */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              Visual Scanner Powered by Gemini 3.8 Flash Vision
            </span>

            <button
              onClick={() =>
                onShareReportToMobile({
                  type: 'camera',
                  summary: report.analysis,
                  verdict: report.threatLevel,
                  riskScore: report.riskScore,
                  target: 'Camera Snapshot Frame',
                })
              }
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-semibold transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Copy Visual Audit to Mobile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
