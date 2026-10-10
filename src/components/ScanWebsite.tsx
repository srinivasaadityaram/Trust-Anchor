import React, { useState } from 'react';
import {
  Globe,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Share2,
  Copy,
  Check,
  FileText,
  Lock,
} from 'lucide-react';
import { ThreatScanReport } from '../types';

interface ScanWebsiteProps {
  isLight: boolean;
  onAddXp: (amount: number) => void;
  onShareReportToMobile: (report: {
    type: 'threat';
    summary: string;
    verdict: string;
    riskScore: number;
    target: string;
  }) => void;
  initialInput?: string;
}

const PRESETS = [
  { label: '🚨 Phishing Bank Link', content: 'https://security-verify-wellsfargo-auth.cc/login' },
  { label: '📦 USPS Smishing Text', content: 'USPS: Package delayed due to missing zip code. Update at http://usps-redelivery.top' },
  { label: '💰 Crypto Airdrop Scam', content: 'https://claim-5000-solana-airdrop.xyz/connect-wallet' },
  { label: '✅ Verified Official Portal', content: 'https://www.onlinesbi.sbi' },
];

export const ScanWebsite: React.FC<ScanWebsiteProps> = ({
  isLight,
  onAddXp,
  onShareReportToMobile,
  initialInput = '',
}) => {
  const [content, setContent] = useState<string>(initialInput || 'https://security-verify-wellsfargo-auth.cc/login');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<ThreatScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string>('');

  const isUrl = /^https?:\/\//i.test(content.trim()) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(content.trim());

  const handleScan = async (override?: string) => {
    const target = (override !== undefined ? override : content).trim();
    if (!target) {
      setError('Please enter a website link or message text to inspect.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setLastScanned(target);

    try {
      const response = await fetch('/api/scan-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: target,
          type: isUrl ? 'url' : 'text',
        }),
      });

      if (!response.ok) throw new Error('Scan request failed');
      const data = await response.json();
      if (data.report) {
        setReport(data.report);
        onAddXp(30);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to analyze target link. Please check network connection.');
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

  const inputStyle = isLight
    ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
    : 'bg-slate-950 border-slate-700 text-white placeholder:text-slate-500';

  return (
    <div className={`w-full rounded-2xl border border-amber-500/40 p-6 sm:p-8 space-y-6 ${cardStyle}`}>
      {/* Title */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
            UNIVERSAL LINK &amp; TEXT SCAM SCANNER
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Scan a Website Link or Raw Text to Check If It Is Real or a Scam Trap
        </h1>
        <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          Paste any website URL or message text (such as an SMS package alert or email) below to check its risk rating (Low, Medium, or High Risk).
        </p>
      </div>

      {/* Preset samples */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono text-slate-400 font-semibold uppercase">
          Sample Test Vectors:
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setContent(p.content);
                handleScan(p.content);
              }}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                isLight
                  ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'
                  : 'border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleScan();
        }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            {isUrl ? (
              <Globe className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            ) : (
              <FileText className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            )}
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste website link or SMS text here (e.g. http://... or 'Your parcel is delayed')..."
              className={`w-full border rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-amber-400 font-mono ${inputStyle}`}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                <span>Scan Link Now</span>
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Scan Results */}
      {report && (
        <div className={`p-6 rounded-2xl border space-y-5 animate-fade-in ${innerCardStyle}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/40">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  report.riskScore >= 60
                    ? 'bg-rose-500/20 text-rose-400'
                    : report.riskScore >= 35
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {report.riskScore >= 60 ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>
              <div>
                <div
                  className={`text-xs font-bold uppercase tracking-wider ${
                    report.riskScore >= 60
                      ? isLight ? 'text-rose-700' : 'text-rose-400'
                      : report.riskScore >= 35
                      ? isLight ? 'text-amber-700' : 'text-amber-400'
                      : isLight ? 'text-emerald-700' : 'text-emerald-400'
                  }`}
                >
                  Verdict: {report.verdict} (Risk: {report.riskScore}%)
                </div>
                <div className="text-base font-bold text-slate-100 break-all">
                  Target: {lastScanned}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onShareReportToMobile({
                  type: 'threat',
                  summary: report.summary,
                  verdict: report.verdict,
                  riskScore: report.riskScore,
                  target: lastScanned,
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Copy to Mobile</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
              Threat Evaluation:
            </div>
            <p className="text-sm leading-relaxed text-slate-200">
              {report.summary}
            </p>
          </div>

          {report.redFlags?.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
                Detected Red Flags:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {report.redFlags.map((flag, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{flag.signal}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{flag.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.recommendedActions?.length > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-slate-200 space-y-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Recommended Actions:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                {report.recommendedActions.map((act, idx) => (
                  <li key={idx}>{act}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
