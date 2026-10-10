import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Lock,
  FileText,
  Globe,
  Share2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ThreatScanReport } from '../types';

interface ShieldScannerProps {
  onShareReportToMobile: (report: {
    type: 'threat';
    summary: string;
    verdict: string;
    riskScore: number;
    target: string;
  }) => void;
}

const PRESET_EXAMPLES = [
  {
    label: '🚨 Banking Phishing URL',
    content: 'https://security-verify-wellsfargo-auth.cc/login/update-pin',
    type: 'url',
  },
  {
    label: '📦 Fake USPS SMS Text',
    content: 'USPS Notice: Your package could not be delivered due to incomplete address. Please verify your details within 12 hours or item will be returned: http://usps-redelivery-postal.top/tracking',
    type: 'text',
  },
  {
    label: '💰 Crypto Wallet Scam',
    content: 'Exclusive 5,000 SOL airdrop! Connect your phantom or metamask wallet now to claim instant reward. Only 200 slots remaining: https://solana-foundation-airdrop-claim.xyz',
    type: 'url',
  },
  {
    label: '✅ Verified Safe Link',
    content: 'https://www.paypal.com/signin',
    type: 'url',
  },
];

export const ShieldScanner: React.FC<ShieldScannerProps> = ({ onShareReportToMobile }) => {
  const [inputContent, setInputContent] = useState<string>('https://security-verify-wellsfargo-auth.cc/login/update-pin');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<ThreatScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedTarget, setLastScannedTarget] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);

  const isUrl = /^https?:\/\//i.test(inputContent.trim()) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(inputContent.trim());

  const handleScan = async (overrideContent?: string) => {
    const target = (overrideContent !== undefined ? overrideContent : inputContent).trim();
    if (!target) {
      setError('Please enter a URL or paste suspicious text to scan.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setLastScannedTarget(target);

    try {
      const response = await fetch('/api/scan-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: target,
          type: isUrl ? 'url' : 'text',
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.report) {
        setReport(data.report);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err: any) {
      console.error('Scan failed:', err);
      setError('Failed to analyze threat. Please try again or check network connectivity.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShieldClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // CRITICAL REQUIREMENT: "when we click on shield it shouldn't be clickable as a redirect, but instead trigger a scan of the provided URL."
    handleScan();
  };

  const handleCopyInput = async () => {
    if (!inputContent) return;
    try {
      await navigator.clipboard.writeText(inputContent);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // fallback
    }
  };

  const getVerdictTheme = (score: number, verdict: string) => {
    if (score >= 75 || verdict === 'MALICIOUS' || verdict === 'HIGH_RISK') {
      return {
        badgeBg: 'bg-rose-500/20 border-rose-500/50 text-rose-300',
        scoreColor: 'text-rose-400',
        barColor: 'bg-rose-500',
        glowColor: 'shadow-rose-950/80 border-rose-500/40',
        icon: <ShieldAlert className="w-8 h-8 text-rose-400" />,
        level: 'CRITICAL HAZARD',
      };
    }
    if (score >= 40 || verdict === 'SUSPICIOUS') {
      return {
        badgeBg: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
        scoreColor: 'text-amber-400',
        barColor: 'bg-amber-500',
        glowColor: 'shadow-amber-950/80 border-amber-500/40',
        icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
        level: 'SUSPICIOUS RISK',
      };
    }
    return {
      badgeBg: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
      scoreColor: 'text-emerald-400',
      barColor: 'bg-emerald-500',
      glowColor: 'shadow-emerald-950/80 border-emerald-500/40',
      icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
      level: 'SAFE / VERIFIED',
    };
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Hero Headline & Security Shield Core */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-4">
          <Zap className="w-3.5 h-3.5" />
          <span>Universal Threat &amp; Scam Scanner</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
          Detect Fraud, Phishing &amp; Malicious Links
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Analyze suspicious website URLs, urgent phishing SMS, lottery scams, or message texts.
          Click the glowing <strong className="text-cyan-400">Shield in the middle</strong> to trigger immediate AI inspection.
        </p>

        {/* Central Shield Icon - NON-REDIRECTABLE, TRIGGERS SCAN */}
        <div className="mt-8 mb-6 flex flex-col items-center justify-center">
          <div className="relative group cursor-pointer" onClick={handleShieldClick}>
            {/* Ambient cyber rings */}
            <div className={`absolute -inset-6 rounded-full opacity-40 blur-xl transition duration-500 ${
              isLoading ? 'bg-amber-500/40 animate-pulse' : 'bg-cyan-500/30 group-hover:bg-cyan-400/50'
            }`} />

            <div className="absolute -inset-3 rounded-full border border-cyan-500/30 border-dashed animate-spin group-hover:border-cyan-400 transition" style={{ animationDuration: '24s' }} />

            {/* The Middle Shield Button */}
            <button
              type="button"
              onClick={handleShieldClick}
              disabled={isLoading}
              title="Click Shield Icon to trigger threat scan"
              className={`relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 border-2 transition-all duration-300 shadow-2xl cursor-pointer ${
                isLoading
                  ? 'border-amber-400 shadow-amber-500/30 scale-95'
                  : 'border-cyan-400/80 hover:border-cyan-300 hover:scale-105 shadow-cyan-950/90 hover:shadow-cyan-500/40'
              }`}
            >
              {isLoading ? (
                <div className="flex flex-col items-center gap-1.5">
                  <RefreshCw className="w-10 h-10 text-amber-400 animate-spin" />
                  <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-widest">
                    Scanning
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Shield className="w-11 h-11 sm:w-12 sm:h-12 text-cyan-400 group-hover:text-cyan-300 transition-colors drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
                  <span className="text-[10px] font-mono text-cyan-300 font-semibold tracking-wider">
                    CLICK TO SCAN
                  </span>
                </div>
              )}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Central Shield Core: Tap to initiate zero-trust scan</span>
          </div>
        </div>
      </div>

      {/* Universal Scanner Input Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-md mb-8">
        <div className="flex items-center justify-between gap-2 mb-3">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            {isUrl ? <Globe className="w-4 h-4 text-cyan-400" /> : <FileText className="w-4 h-4 text-indigo-400" />}
            <span>Enter Target URL or Suspicious Message Text:</span>
          </label>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {isUrl ? 'Type: URL Destination' : 'Type: Raw Text / SMS'}
          </span>
        </div>

        <div className="relative">
          <textarea
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder="Paste any link (e.g., https://secure-bank-login.xyz) OR any message text (e.g., 'Your account is suspended, click here')..."
            rows={3}
            className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono resize-none transition"
          />

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            {inputContent && (
              <button
                onClick={handleCopyInput}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition text-xs flex items-center gap-1 cursor-pointer"
                title="Copy input text"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
            <button
              onClick={() => setInputContent('')}
              className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 bg-slate-800/60 rounded-md cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Action Button & Preset Samples */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="w-full sm:w-auto flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-400 font-mono">Sample Presets:</span>
            {PRESET_EXAMPLES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputContent(preset.content);
                  handleScan(preset.content);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleScan()}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-sm font-bold shadow-lg shadow-cyan-950/60 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Vector...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Execute Deep Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scan Results Display */}
      {report && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-fade-in">
          {/* Top Verdict Banner */}
          {(() => {
            const theme = getVerdictTheme(report.riskScore, report.verdict);
            return (
              <div className={`p-5 rounded-xl border ${theme.glowColor} bg-slate-950/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    {theme.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}>
                        {report.verdict}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Category: {report.threatCategory}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {report.title}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-1 break-all line-clamp-1">
                      Scanned Target: {lastScannedTarget}
                    </p>
                  </div>
                </div>

                {/* Risk Gauge */}
                <div className="w-full md:w-auto flex md:flex-col items-center justify-between md:items-end gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
                      Threat Risk Score
                    </span>
                    <span className={`text-2xl sm:text-3xl font-black ${theme.scoreColor}`}>
                      {report.riskScore}
                      <span className="text-sm text-slate-500 font-normal">/100</span>
                    </span>
                  </div>
                  <div className="w-28 sm:w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${theme.barColor} transition-all duration-1000`}
                      style={{ width: `${Math.min(100, Math.max(5, report.riskScore))}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Summary */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-sm text-slate-300 leading-relaxed">
            <h3 className="text-xs font-mono uppercase text-slate-400 mb-1 flex items-center gap-1.5 font-bold">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Executive Forensic Summary
            </h3>
            <p>{report.summary}</p>
          </div>

          {/* Red Flags & Threat Indicators */}
          {report.redFlags && report.redFlags.length > 0 && (
            <div>
              <h3 className="text-xs font-mono uppercase text-slate-400 mb-3 flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Detected Threat Signals &amp; Red Flags ({report.redFlags.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.redFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200">
                        {flag.signal}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                          flag.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : flag.severity === 'HIGH'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {flag.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Breakdown */}
          {report.technicalBreakdown && (
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-xs font-mono text-cyan-400 font-bold uppercase mb-1">
                Technical Syntactic &amp; Heuristic Evaluation
              </h4>
              <p className="text-xs text-slate-300 font-mono">
                {report.technicalBreakdown}
              </p>
            </div>
          )}

          {/* Recommended Protective Actions */}
          {report.recommendedActions && report.recommendedActions.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Immediate Defensive Protocol
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {report.recommendedActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom Bar: Copy to Mobile */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-mono">
              Scanned with Gemini 3.8 Flash Neural Defense Heuristics
            </span>

            <button
              onClick={() =>
                onShareReportToMobile({
                  type: 'threat',
                  summary: report.summary,
                  verdict: report.verdict,
                  riskScore: report.riskScore,
                  target: lastScannedTarget,
                })
              }
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-semibold transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Copy Threat Advisory to Mobile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
