import React, { useState } from 'react';
import {
  Shield,
  Globe,
  Camera,
  Smartphone,
  Instagram,
  AlertOctagon,
  QrCode,
  Search,
  RefreshCw,
  Share2,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ThreatScanReport } from '../types';

interface OrbitItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  angleDeg: number;
  darkGradient: string;
  lightGradient: string;
  darkIconBox: string;
  lightIconBox: string;
}

interface OrbitHubProps {
  isLight: boolean;
  xp: number;
  onNavigate: (screenId: string) => void;
  onAddXp: (amount: number) => void;
  onShareReportToMobile: (report: {
    type: 'threat';
    summary: string;
    verdict: string;
    riskScore: number;
    target: string;
  }) => void;
}

const ORBIT_ITEMS: OrbitItem[] = [
  {
    id: 'scan-website',
    title: 'Scan Website',
    subtitle: 'Check link risk (Low, Med, High)',
    icon: Globe,
    angleDeg: 0,
    darkGradient: 'from-amber-600/35 via-amber-800/25 to-slate-900/90 border-amber-400/40 hover:border-amber-300',
    lightGradient: 'from-amber-100 via-amber-50/95 to-white border-amber-400/80 hover:border-amber-500 shadow-amber-500/10',
    darkIconBox: 'bg-amber-950/80 text-amber-400 border border-amber-500/30',
    lightIconBox: 'bg-amber-100 text-amber-700 border border-amber-300',
  },
  {
    id: 'fake-vs-real-brands',
    title: 'Fake vs Real Brands',
    subtitle: 'Upload product photo to check',
    icon: Camera,
    angleDeg: 60,
    darkGradient: 'from-cyan-500/35 via-teal-800/25 to-slate-900/90 border-cyan-400/40 hover:border-cyan-300',
    lightGradient: 'from-cyan-100 via-cyan-50/95 to-white border-cyan-400/80 hover:border-cyan-500 shadow-cyan-500/10',
    darkIconBox: 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30',
    lightIconBox: 'bg-cyan-100 text-cyan-700 border border-cyan-300',
  },
  {
    id: 'fake-vs-real-apps',
    title: 'Fake vs Real Apps',
    subtitle: 'Check app URL, APK & ratings',
    icon: Smartphone,
    angleDeg: 120,
    darkGradient: 'from-emerald-600/35 via-emerald-900/25 to-slate-900/90 border-emerald-400/40 hover:border-emerald-300',
    lightGradient: 'from-emerald-100 via-emerald-50/95 to-white border-emerald-400/80 hover:border-emerald-500 shadow-emerald-500/10',
    darkIconBox: 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30',
    lightIconBox: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
  },
  {
    id: 'social-check',
    title: 'Social Media Check',
    subtitle: 'Spot fake brand accounts & IG',
    icon: Instagram,
    angleDeg: 180, // replacing old spot-scam!
    darkGradient: 'from-fuchsia-500/35 via-purple-900/30 to-slate-900/90 border-fuchsia-400/40 hover:border-fuchsia-300',
    lightGradient: 'from-fuchsia-100 via-purple-50/95 to-white border-fuchsia-400/80 hover:border-fuchsia-500 shadow-fuchsia-500/10',
    darkIconBox: 'bg-purple-950/80 text-pink-200 border border-fuchsia-500/30',
    lightIconBox: 'bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-300',
  },
  {
    id: 'threat-intel',
    title: 'Threat Intelligence',
    subtitle: 'Active scam alerts & safety',
    icon: AlertOctagon,
    angleDeg: 240,
    darkGradient: 'from-orange-500/35 via-amber-900/25 to-slate-900/90 border-orange-400/40 hover:border-orange-300',
    lightGradient: 'from-orange-100 via-orange-50/95 to-white border-orange-400/80 hover:border-orange-500 shadow-orange-500/10',
    darkIconBox: 'bg-orange-950/80 text-amber-300 border border-orange-500/30',
    lightIconBox: 'bg-orange-100 text-orange-700 border border-orange-300',
  },
  {
    id: 'mobile-sync',
    title: 'Copy to Mobile',
    subtitle: 'Phone QR & live camera link',
    icon: QrCode,
    angleDeg: 300, // replacing old portals!
    darkGradient: 'from-cyan-400/45 via-sky-800/30 to-slate-900/90 border-cyan-300/50 hover:border-cyan-200',
    lightGradient: 'from-sky-100 via-sky-50/95 to-white border-sky-400/80 hover:border-sky-500 shadow-sky-500/10',
    darkIconBox: 'bg-sky-950/80 text-cyan-300 border border-sky-500/30',
    lightIconBox: 'bg-sky-100 text-sky-700 border border-sky-300',
  },
];

export const OrbitHub: React.FC<OrbitHubProps> = ({
  isLight,
  xp,
  onNavigate,
  onAddXp,
  onShareReportToMobile,
}) => {
  const [quickInput, setQuickInput] = useState<string>('https://security-verify-wellsfargo-auth.cc/login');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ThreatScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Trigger scan when Shield in middle is clicked:
  // "when we click on shield it shouldn't be clickable as a redirect, but instead trigger a scan of the provided URL."
  const handleShieldClick = async () => {
    const target = quickInput.trim();
    if (!target) {
      setError('Please enter a website link or message text to trigger the scan.');
      return;
    }

    setError(null);
    setIsScanning(true);

    try {
      const response = await fetch('/api/scan-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: target,
          type: 'auto',
        }),
      });

      if (!response.ok) throw new Error('Scan request failed');
      const data = await response.json();
      if (data.report) {
        setScanResult(data.report);
        onAddXp(30);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to analyze target. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const inputStyle = isLight
    ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
    : 'bg-slate-950 border-slate-700 text-white placeholder:text-slate-500';

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full px-4 sm:px-6 py-4">
      {/* Subtitle / Hook */}
      <div className="text-center mb-4 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono mb-2">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>Tap Center Shield to Trigger Scan</span>
        </div>
        <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Select an orbiting module or enter a link/text below and click the central <strong className="text-cyan-400">Shield Icon</strong> to scan!
        </p>
      </div>

      {/* DESKTOP CIRCULAR ORBIT PATH */}
      <div className="hidden sm:block relative w-[620px] md:w-[740px] h-[480px] md:h-[530px] my-auto">
        {/* Circular Dashed Orbit Ring */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] md:w-[520px] h-[390px] md:h-[420px] rounded-full border border-dashed pointer-events-none ${
            isLight ? 'border-cyan-400/40' : 'border-cyan-500/25'
          }`}
        />

        {/* Center Shield Button (Triggers scan directly!) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center z-20">
          <button
            type="button"
            onClick={handleShieldClick}
            disabled={isScanning}
            title="Click Shield Icon to trigger security scan of provided URL"
            className={`group relative w-28 h-28 md:w-32 md:h-32 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 cursor-pointer ${
              isScanning
                ? 'bg-amber-950/80 border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.5)]'
                : isLight
                ? 'bg-white border-cyan-500 shadow-[0_0_45px_rgba(14,165,233,0.30)] hover:shadow-[0_0_60px_rgba(14,165,233,0.5)]'
                : 'bg-[#111927] border-cyan-400/80 shadow-[0_0_50px_rgba(34,211,238,0.35)] hover:shadow-[0_0_65px_rgba(34,211,238,0.55)]'
            }`}
          >
            {isScanning ? (
              <RefreshCw className="w-10 h-10 md:w-11 md:h-11 text-amber-400 animate-spin" />
            ) : (
              <Shield className="w-10 h-10 md:w-11 md:h-11 text-amber-400 stroke-[2.2] group-hover:scale-110 transition-transform" />
            )}
            <span
              className={`mt-1.5 text-[11px] font-bold tracking-widest ${
                isScanning ? 'text-amber-300' : isLight ? 'text-cyan-700' : 'text-cyan-300'
              }`}
            >
              {isScanning ? 'SCANNING' : 'SHIELD'}
            </span>
          </button>
          <div
            className={`mt-2 text-xs font-mono font-semibold tabular-nums ${
              isLight ? 'text-emerald-600' : 'text-emerald-400'
            }`}
          >
            ★ {xp} XP
          </div>
        </div>

        {/* Orbiting Items */}
        {ORBIT_ITEMS.map((item) => {
          const Icon = item.icon;
          const rad = ((item.angleDeg - 90) * Math.PI) / 180;
          const x = Math.cos(rad) * 235;
          const y = Math.sin(rad) * 195;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
              className={`-translate-x-1/2 -translate-y-1/2 absolute w-40 md:w-44 h-[100px] md:h-28 rounded-2xl border bg-gradient-to-b ${
                isLight ? item.lightGradient : item.darkGradient
              } backdrop-blur-md p-3 flex flex-col items-center justify-center text-center ${
                isLight ? 'shadow-lg' : 'shadow-[0_10px_30px_rgba(0,0,0,0.45)]'
              } transition-transform duration-200 hover:scale-105 cursor-pointer z-10`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 ${
                  isLight ? item.lightIconBox : item.darkIconBox
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div
                className={`text-xs font-bold leading-tight truncate w-full ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {item.title}
              </div>
              <div
                className={`text-[10px] mt-0.5 truncate w-full ${
                  isLight ? 'text-slate-600' : 'text-slate-300/90'
                }`}
              >
                {item.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* MOBILE CIRCULAR ORBIT PATH */}
      <div className="sm:hidden relative w-[340px] h-[390px] mx-auto my-2">
        {/* Dashed circular ring */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[236px] h-[264px] rounded-full border border-dashed pointer-events-none ${
            isLight ? 'border-cyan-400/40' : 'border-cyan-500/20'
          }`}
        />

        {/* Center Shield Button */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center z-20">
          <button
            type="button"
            onClick={handleShieldClick}
            disabled={isScanning}
            className={`w-[88px] h-[88px] rounded-full border-2 flex flex-col items-center justify-center transition-transform active:scale-95 cursor-pointer ${
              isScanning
                ? 'bg-amber-950/80 border-amber-400'
                : isLight
                ? 'bg-white border-cyan-500 shadow-[0_0_30px_rgba(14,165,233,0.30)]'
                : 'bg-[#111927] border-cyan-400/80 shadow-[0_0_35px_rgba(34,211,238,0.35)]'
            }`}
            title="Tap Shield to Scan URL"
          >
            {isScanning ? (
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            ) : (
              <Shield className="w-8 h-8 text-amber-400 stroke-[2.2]" />
            )}
            <span
              className={`mt-1 text-[9px] font-bold tracking-widest ${
                isScanning ? 'text-amber-300' : isLight ? 'text-cyan-700' : 'text-cyan-300'
              }`}
            >
              {isScanning ? 'SCANNING' : 'SHIELD'}
            </span>
          </button>
          <div
            className={`mt-1 text-[10px] font-mono font-semibold tabular-nums ${
              isLight ? 'text-emerald-600' : 'text-emerald-400'
            }`}
          >
            ★ {xp} XP
          </div>
        </div>

        {/* Orbiting buttons */}
        {ORBIT_ITEMS.map((item) => {
          const Icon = item.icon;
          const rad = ((item.angleDeg - 90) * Math.PI) / 180;
          const x = Math.cos(rad) * 114;
          const y = Math.sin(rad) * 134;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
              className={`-translate-x-1/2 -translate-y-1/2 absolute w-[104px] h-[74px] rounded-2xl border bg-gradient-to-b ${
                isLight ? item.lightGradient : item.darkGradient
              } backdrop-blur-md p-1.5 flex flex-col items-center justify-center text-center ${
                isLight ? 'shadow-md' : 'shadow-[0_8px_20px_rgba(0,0,0,0.45)]'
              } transition-transform active:scale-95 cursor-pointer z-10`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center mb-1 ${
                  isLight ? item.lightIconBox : item.darkIconBox
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div
                className={`text-[10px] font-bold leading-tight line-clamp-1 w-full ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {item.title}
              </div>
              <div
                className={`text-[8px] leading-tight truncate w-full mt-0.5 ${
                  isLight ? 'text-slate-600' : 'text-slate-300/90'
                }`}
              >
                {item.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* QUICK SCANNER INPUT BAR & IMMEDIATE RESULTS */}
      <div className="w-full max-w-xl mx-auto mt-4 sm:mt-6">
        <div className="flex items-center gap-2 mb-1.5 px-1">
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className={`text-[11px] font-mono font-semibold uppercase ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Quick Scanner — Click Shield to Trigger:
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Paste URL or message text (e.g. https://... or 'Your parcel is delayed')..."
            className={`flex-1 border rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-cyan-400 ${inputStyle}`}
          />
          <button
            type="button"
            onClick={handleShieldClick}
            disabled={isScanning}
            className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isScanning ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>

        {error && (
          <div className="mt-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Scan Result Card */}
        {scanResult && (
          <div
            className={`mt-4 p-5 rounded-2xl border space-y-3 animate-fade-in ${
              isLight ? 'bg-white border-slate-300 shadow-xl' : 'bg-slate-900/95 border-slate-800 shadow-2xl'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                    scanResult.riskScore >= 60
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {scanResult.verdict}
                </span>
                <span className="text-xs font-bold text-slate-100">
                  Risk Score: {scanResult.riskScore}%
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onShareReportToMobile({
                    type: 'threat',
                    summary: scanResult.summary,
                    verdict: scanResult.verdict,
                    riskScore: scanResult.riskScore,
                    target: quickInput,
                  })
                }
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Share2 className="w-3 h-3" />
                <span>Copy to Mobile</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {scanResult.summary}
            </p>

            {scanResult.recommendedActions?.length > 0 && (
              <div className="text-[11px] text-emerald-400 font-mono">
                ✓ {scanResult.recommendedActions[0]}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
