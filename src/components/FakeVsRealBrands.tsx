import React, { useState } from 'react';
import {
  Upload,
  Camera,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Share2,
  Shield,
  Eye,
  Lock,
} from 'lucide-react';
import { ImageScanReport } from '../types';

interface FakeVsRealBrandsProps {
  isLight: boolean;
  onAddXp: (amount: number) => void;
  onOpenLiveCamera: () => void;
  onShareReportToMobile: (report: {
    type: 'camera';
    summary: string;
    verdict: string;
    riskScore: number;
    target: string;
  }) => void;
}

export const FakeVsRealBrands: React.FC<FakeVsRealBrandsProps> = ({
  isLight,
  onAddXp,
  onOpenLiveCamera,
  onShareReportToMobile,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [userNote, setUserNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<ImageScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setImagePreview(b64);
      analyzeBrandImage(b64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const analyzeBrandImage = async (base64: string, name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scan-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: 'image/jpeg',
          scanContext: `Product Brand Inspection: ${name}. Note: ${userNote}`,
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      if (data.report) {
        setReport(data.report);
        onAddXp(30);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const cardStyle = isLight
    ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
    : 'bg-slate-900/85 border-slate-800 text-slate-100 shadow-2xl';

  const innerCardStyle = isLight
    ? 'bg-slate-100/90 border-slate-200 text-slate-800'
    : 'bg-slate-950/70 border-slate-800 text-slate-200';

  return (
    <div className={`w-full rounded-2xl border border-cyan-500/40 p-6 sm:p-8 space-y-6 ${cardStyle}`}>
      {/* Title */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
            FAKE VS REAL BRANDS — PRODUCT PHOTO CHECKER
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Upload a Picture of a Product to Check If the Brand Is Real or Fake
        </h1>
        <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          Have a doubt about a product's brand, logo, or packaging? Upload a photo below or use the transparent live camera to inspect hallmarks and counterfeit signals.
        </p>
      </div>

      {/* Upload & Camera Actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <label
          className={`md:col-span-8 p-6 rounded-2xl border-2 border-dashed border-cyan-500/50 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-colors min-h-[220px] ${innerCardStyle}`}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Uploaded product preview"
              className="max-h-48 rounded-xl object-contain border border-slate-700 shadow-md"
            />
          ) : (
            <>
              <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 text-cyan-400">
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-sm font-bold">
                {imageName ? `Selected: ${imageName}` : 'Click to Upload Product Picture'}
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                Supports JPG, PNG, WEBP. Clear photos of labels, barcodes, and logos give the most accurate results.
              </p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <div className="md:col-span-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={onOpenLiveCamera}
            className="w-full p-4 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white transition cursor-pointer flex flex-col items-center justify-center text-center space-y-2"
          >
            <Camera className="w-7 h-7 text-cyan-400" />
            <span className="text-xs font-bold">Open Live Transparent Camera</span>
            <span className="text-[10px] text-slate-400">Point phone camera directly at package</span>
          </button>

          <div className="p-3.5 rounded-xl border border-slate-700/60 bg-slate-950/60 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-200 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-cyan-400" /> Privacy Protected
            </span>
            <p className="text-[11px]">
              Single snapshots evaluated ephemerally in browser memory. Never saved to public databases.
            </p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center gap-2 text-cyan-300 text-xs">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Analyzing product packaging &amp; brand hallmarks with Gemini Vision...</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Result */}
      {report && (
        <div className={`p-6 rounded-2xl border space-y-4 animate-fade-in ${innerCardStyle}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/40">
            <div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${
                  report.threatLevel === 'CLEAN' || report.riskScore < 30
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                Inspection Verdict: {report.threatLevel} (Risk: {report.riskScore}%)
              </div>
              <div className="text-sm font-bold text-slate-100">
                {report.immediateWarning || 'Brand inspection complete'}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onShareReportToMobile({
                  type: 'camera',
                  summary: report.analysis,
                  verdict: report.threatLevel,
                  riskScore: report.riskScore,
                  target: imageName || 'Product Picture',
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Copy to Mobile</span>
            </button>
          </div>

          <p className="text-sm leading-relaxed text-slate-200">
            {report.analysis}
          </p>

          {report.textExtracted && (
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
              <span className="text-cyan-400 font-bold block mb-1">OCR Text Found:</span>
              {report.textExtracted}
            </div>
          )}

          {report.safeActions?.length > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-slate-300">
              <span className="font-bold text-emerald-400 block mb-1">Recommended Verification:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {report.safeActions.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
