import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Share2,
  ExternalLink,
  Shield,
  Star,
} from 'lucide-react';
import { OFFICIAL_BRANDS } from '../data/brands';

interface FakeVsRealAppsProps {
  isLight: boolean;
  onAddXp: (amount: number) => void;
  onShareReportToMobile: (report: {
    type: 'threat';
    summary: string;
    verdict: string;
    riskScore: number;
    target: string;
  }) => void;
}

export const FakeVsRealApps: React.FC<FakeVsRealAppsProps> = ({
  isLight,
  onAddXp,
  onShareReportToMobile,
}) => {
  const [appLink, setAppLink] = useState<string>('https://play.google.com/store/apps/details?id=com.sbi.lotusintouch');
  const [result, setResult] = useState<any>(null);

  const handleCheckApp = (e?: React.FormEvent, override?: string) => {
    if (e) e.preventDefault();
    const target = (override !== undefined ? override : appLink).trim();
    if (!target) return;

    const lower = target.toLowerCase();
    const isPlayStore = lower.includes('play.google.com/store/apps') || lower.includes('apps.apple.com');
    const isApkDownload = lower.includes('.apk') || lower.includes('apkpure') || lower.includes('apkmirror') || lower.includes('mediafire');

    const matchedBrand = OFFICIAL_BRANDS.find((b) =>
      b.keywords.some((k) => lower.includes(k)) || lower.includes(b.id)
    );

    let verdict = 'ORIGINAL STORE APPLICATION';
    let riskLevel = 'Low Risk';
    let riskScore = 15;
    let simpleExplanation = '';

    if (isApkDownload) {
      verdict = 'SUSPICIOUS / BROWSER APK FILE';
      riskLevel = 'High Risk';
      riskScore = 88;
      simpleExplanation = `Dangerous! This link downloads a raw .APK installer directly from the browser rather than the official Google Play Store or Apple App Store. Malicious browser APKs often contain spyware, keystroke loggers, or fake banking overlays designed to siphon OTPs.`;
    } else if (isPlayStore) {
      verdict = 'VERIFIED APP STORE APPLICATION';
      riskLevel = 'Low Risk';
      riskScore = 10;
      simpleExplanation = `Safe! This link directs to the verified Google Play Store or Apple App Store. Official store apps undergo automated code scanning for malicious payloads.`;
    } else if (matchedBrand) {
      verdict = 'MATCHES OFFICIAL BRAND ECOSYSTEM';
      riskLevel = 'Low Risk';
      riskScore = 20;
      simpleExplanation = `Official publisher is "${matchedBrand.officialPublisher}". Always install via the official store link (${matchedBrand.primaryOfficialUrl}).`;
    } else {
      verdict = 'UNVERIFIED THIRD-PARTY LINK';
      riskLevel = 'Medium Risk';
      riskScore = 55;
      simpleExplanation = `Link does not point directly to an official app store entry. Exercise caution before downloading or entering sensitive permissions.`;
    }

    setResult({
      link: target,
      verdict,
      riskLevel,
      riskScore,
      isPlayStore,
      isApkDownload,
      matchedPublisher: matchedBrand?.officialPublisher || 'Independent Developer',
      officialPackage: matchedBrand?.officialAppPackage || 'Android Package',
      rating: isPlayStore ? '4.6 ★ (Over 10M+ verified downloads)' : 'Unrated / No Play Protect certification',
      simpleExplanation,
    });

    onAddXp(25);
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
    <div className={`w-full rounded-2xl border border-emerald-500/40 p-6 sm:p-8 space-y-6 ${cardStyle}`}>
      {/* Title */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
            APPLICATION LINK &amp; APK DETECTOR
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Check If an Application Link Is Real (Play Store) or a Fake Browser APK
        </h1>
        <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          Paste the link or URL of any mobile application below. We will tell you if it is a genuine Play Store / App Store app or a dangerous .APK downloaded from a browser!
        </p>
      </div>

      {/* Preset samples */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => {
            const p = 'https://play.google.com/store/apps/details?id=com.sbi.lotusintouch';
            setAppLink(p);
            handleCheckApp(undefined, p);
          }}
          className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
        >
          ✅ Official YONO SBI Play Store Link
        </button>

        <button
          type="button"
          onClick={() => {
            const p = 'http://fast-loan-instant-cash.xyz/app-update-v2.apk';
            setAppLink(p);
            handleCheckApp(undefined, p);
          }}
          className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-rose-300 transition cursor-pointer"
        >
          🚨 Risky Browser .APK Download Link
        </button>
      </div>

      {/* Form */}
      <form onSubmit={(e) => handleCheckApp(e)} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Smartphone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={appLink}
            onChange={(e) => setAppLink(e.target.value)}
            placeholder="Paste application link or URL here (e.g. Play Store link or browser .apk link)..."
            className={`w-full border rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-emerald-400 font-mono ${inputStyle}`}
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          <Smartphone className="w-4 h-4" />
          <span>Check Application</span>
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className={`p-6 rounded-2xl border space-y-4 animate-fade-in ${innerCardStyle}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/40">
            <div>
              <div
                className={`text-xs font-bold uppercase tracking-wider ${
                  result.riskLevel === 'Low Risk' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                Result: {result.verdict} ({result.riskLevel})
              </div>
              <div className="text-sm font-bold text-slate-100 break-all">
                {result.link}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onShareReportToMobile({
                  type: 'threat',
                  summary: result.simpleExplanation,
                  verdict: result.verdict,
                  riskScore: result.riskScore,
                  target: result.link,
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Copy to Mobile</span>
            </button>
          </div>

          <p className="text-sm leading-relaxed text-slate-200">
            {result.simpleExplanation}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Publisher &amp; Package:</span>
              <span className="font-bold text-slate-200">{result.matchedPublisher}</span>
              <span className="block font-mono text-slate-400 text-[11px] mt-0.5">{result.officialPackage}</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">User Rating &amp; Certification:</span>
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {result.rating}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
