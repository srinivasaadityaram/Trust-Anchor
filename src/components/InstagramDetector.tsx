import React, { useState } from 'react';
import {
  Instagram,
  UserCheck,
  UserX,
  AlertTriangle,
  Zap,
  RefreshCw,
  Share2,
  Users,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { InstagramScanReport } from '../types';

interface InstagramDetectorProps {
  onShareReportToMobile: (report: {
    type: 'instagram';
    summary: string;
    verdict: string;
    riskScore: number;
    target: string;
  }) => void;
}

const INSTAGRAM_PRESETS = [
  {
    name: '🤖 Crypto / Forex Bot Impersonator',
    username: 'crypto_sarah_fx_official88',
    bio: 'Certified Crypto & Binary Options Trader 🚀 DM to start earning $5,000/week! WhatsApp: +1 (555) 019-2834. God first 💎',
    followers: '84',
    following: '4,890',
    posts: '3',
    isVerified: false,
  },
  {
    name: '🎭 Romance / Military Doctor Scammer',
    username: 'dr_richard_un_medical',
    bio: 'Orthopedic Surgeon currently on UN peacekeeping mission. Single dad. Looking for honest soulmate. Telegram: @dr_richard_un 🙏',
    followers: '28',
    following: '2,450',
    posts: '2',
    isVerified: false,
  },
  {
    name: '🚨 Meta / IG Support Impersonator',
    username: 'meta_helpdesk_security_team',
    bio: 'Official Instagram Copyright & Security Desk. DM us immediately if your account received a copyright strike or disable warning.',
    followers: '190',
    following: '1,200',
    posts: '0',
    isVerified: false,
  },
  {
    name: '✅ Organic Verified Creator',
    username: 'elena_visuals_travel',
    bio: 'Documentary photographer & conservationist 🌿 Storytelling for NatGeo. Sony Artisan of Imagery. Contact: elena@studio.com',
    followers: '48,200',
    following: '410',
    posts: '380',
    isVerified: true,
  },
];

export const InstagramDetector: React.FC<InstagramDetectorProps> = ({
  onShareReportToMobile,
}) => {
  const [username, setUsername] = useState<string>('crypto_sarah_fx_official88');
  const [bio, setBio] = useState<string>(
    'Certified Crypto & Binary Options Trader 🚀 DM to start earning $5,000/week! WhatsApp: +1 (555) 019-2834. God first 💎'
  );
  const [followers, setFollowers] = useState<string>('84');
  const [following, setFollowing] = useState<string>('4890');
  const [posts, setPosts] = useState<string>('3');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<InstagramScanReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedUsername, setLastScannedUsername] = useState<string>('');

  const handleRunScan = async (presetOverride?: typeof INSTAGRAM_PRESETS[0]) => {
    const targetUser = presetOverride ? presetOverride.username : username;
    const targetBio = presetOverride ? presetOverride.bio : bio;
    const targetFollowers = presetOverride ? presetOverride.followers : followers;
    const targetFollowing = presetOverride ? presetOverride.following : following;
    const targetPosts = presetOverride ? presetOverride.posts : posts;
    const targetVerified = presetOverride ? presetOverride.isVerified : isVerified;

    if (!targetUser && !targetBio) {
      setError('Please provide an Instagram username or bio to analyze.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setLastScannedUsername(targetUser);

    try {
      const response = await fetch('/api/scan-instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: targetUser,
          bio: targetBio,
          followers: targetFollowers,
          following: targetFollowing,
          posts: targetPosts,
          isVerified: targetVerified,
          notes: additionalNotes,
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
      console.error('Instagram scan error:', err);
      setError('Failed to complete Instagram audit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictTheme = (verdict: string, fakeProb: number) => {
    if (fakeProb >= 70 || verdict === 'CONFIRMED_FAKE_BOT' || verdict === 'HIGH_RISK_IMPERSONATOR') {
      return {
        badgeBg: 'bg-rose-500/20 border-rose-500/50 text-rose-300',
        scoreColor: 'text-rose-400',
        barColor: 'bg-rose-500',
        glowColor: 'shadow-rose-950/80 border-rose-500/40',
        icon: <UserX className="w-8 h-8 text-rose-400" />,
        label: 'LIKELY FAKE / BOT ACCOUNT',
      };
    }
    if (fakeProb >= 40 || verdict === 'SUSPICIOUS_ENGAGEMENT') {
      return {
        badgeBg: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
        scoreColor: 'text-amber-400',
        barColor: 'bg-amber-500',
        glowColor: 'shadow-amber-950/80 border-amber-500/40',
        icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
        label: 'SUSPICIOUS / ARTIFICIAL ACTIVITY',
      };
    }
    return {
      badgeBg: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
      scoreColor: 'text-emerald-400',
      barColor: 'bg-emerald-500',
      glowColor: 'shadow-emerald-950/80 border-emerald-500/40',
      icon: <UserCheck className="w-8 h-8 text-emerald-400" />,
      label: 'ORGANIC / AUTHENTIC PROFILE',
    };
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono mb-4">
          <Instagram className="w-3.5 h-3.5" />
          <span>Instagram AI Account Forensic Detective</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
          Fake Account &amp; Impersonator AI Detector
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Scans Instagram profiles for fake followers, romance scams, bot farm ratios, off-platform WhatsApp redirects, and deceptive bio patterns using forensic AI analysis.
        </p>
      </div>

      {/* Preset Quick-Test Cards */}
      <div className="mb-6">
        <label className="text-xs font-mono uppercase text-slate-400 mb-2 block font-semibold">
          Select a sample preset or test your own account:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {INSTAGRAM_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUsername(preset.username);
                setBio(preset.bio);
                setFollowers(preset.followers);
                setFollowing(preset.following);
                setPosts(preset.posts);
                setIsVerified(preset.isVerified);
                handleRunScan(preset);
              }}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-pink-500/40 text-left transition group cursor-pointer shadow-sm"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-pink-300 flex items-center justify-between">
                <span>{preset.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">@{preset.username.slice(0, 10)}...</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-mono">
                {preset.bio}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Username */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Instagram Username / Handle:
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
                placeholder="e.g. suspicious_account_99"
                className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono"
              />
            </div>
          </div>

          {/* Verified Toggle */}
          <div className="flex flex-col justify-end">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Official Blue Verification Badge:
            </label>
            <div className="flex items-center gap-3 h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl">
              <input
                type="checkbox"
                id="verifiedCheck"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 rounded text-pink-500 bg-slate-800 border-slate-700 cursor-pointer"
              />
              <label
                htmlFor="verifiedCheck"
                className="text-xs text-slate-300 cursor-pointer flex items-center gap-1.5"
              >
                <span>Account has verified badge</span>
                <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
              </label>
            </div>
          </div>
        </div>

        {/* Bio Text Input */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
            <span>Bio Description (Scanning for Suspicious Patterns):</span>
            <span className="text-[11px] text-slate-500">Paste exact profile bio text</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Paste the Instagram bio here (e.g. 'DM for business, WhatsApp me, investments, etc.')..."
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono resize-none"
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Followers Count:
            </label>
            <input
              type="text"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
              placeholder="e.g. 120"
              className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Following Count:
            </label>
            <input
              type="text"
              value={following}
              onChange={(e) => setFollowing(e.target.value)}
              placeholder="e.g. 4,500"
              className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Posts Count:
            </label>
            <input
              type="text"
              value={posts}
              onChange={(e) => setPosts(e.target.value)}
              placeholder="e.g. 2"
              className="w-full bg-slate-950 border border-slate-800 focus:border-pink-500 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Trigger Button */}
        <button
          onClick={() => handleRunScan()}
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-pink-950/40 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Instagram Profile Patterns...</span>
            </>
          ) : (
            <>
              <Instagram className="w-4 h-4" />
              <span>Run AI Authenticity &amp; Fake Detection</span>
            </>
          )}
        </button>
      </div>

      {/* Forensic Report */}
      {report && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 animate-fade-in">
          {/* Verdict Header */}
          {(() => {
            const theme = getVerdictTheme(report.verdict, report.fakeProbability);
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
                        {report.verdict}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        AI Confidence: {report.confidence}%
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      @{lastScannedUsername}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {theme.label}
                    </p>
                  </div>
                </div>

                {/* Authenticity vs Fake Probability Gauge */}
                <div className="w-full md:w-auto flex md:flex-col items-center justify-between md:items-end gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">
                      Fake Probability
                    </span>
                    <span className={`text-3xl font-black ${theme.scoreColor}`}>
                      {report.fakeProbability}%
                    </span>
                  </div>
                  <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${theme.barColor} transition-all duration-1000`}
                      style={{ width: `${Math.min(100, Math.max(5, report.fakeProbability))}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Authenticity: {report.authenticityScore}%
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Profile Summary */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-300">
            <h3 className="text-xs font-mono uppercase text-slate-400 mb-1 flex items-center gap-1.5 font-bold">
              <Users className="w-3.5 h-3.5 text-pink-400" />
              Forensic Account Profile Assessment
            </h3>
            <p>{report.profileSummary}</p>
          </div>

          {/* Bio Pattern Analysis */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h3 className="text-xs font-mono uppercase text-pink-400 mb-2 flex items-center gap-1.5 font-bold">
              <MessageSquare className="w-3.5 h-3.5" />
              Bio Pattern Forensic Scan
            </h3>
            <p className="text-xs text-slate-300 mb-3">
              {report.bioAnalysis.explanation}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Off-Platform Redirection (WhatsApp/Telegram):</span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    report.bioAnalysis.offPlatformRedirection
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {report.bioAnalysis.offPlatformRedirection ? 'DETECTED' : 'CLEAR'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Urgency or Financial Pitch:</span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    report.bioAnalysis.urgencyOrFinancialPitches
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {report.bioAnalysis.urgencyOrFinancialPitches ? 'DETECTED' : 'CLEAR'}
                </span>
              </div>
            </div>

            {report.bioAnalysis.suspiciousPatternsFound?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {report.bioAnalysis.suspiciousPatternsFound.map((pat, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30"
                  >
                    ⚠ {pat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Metrics & Ratio Breakdown */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h3 className="text-xs font-mono uppercase text-indigo-400 mb-2 flex items-center gap-1.5 font-bold">
              <TrendingDown className="w-3.5 h-3.5" />
              Engagement Metrics &amp; Follower Ratio Analysis
            </h3>
            <p className="text-xs text-slate-300 mb-3">
              {report.metricsAnalysis.ratioScoreExplanation}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Ratio Status:</span>
                <span className="font-mono text-cyan-300 font-semibold">
                  {report.metricsAnalysis.ratioStatus}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Ghost Follower / Inactivity Risk:</span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                    report.metricsAnalysis.ghostFollowerRisk === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300'
                      : report.metricsAnalysis.ghostFollowerRisk === 'HIGH'
                      ? 'bg-orange-500/20 text-orange-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {report.metricsAnalysis.ghostFollowerRisk}
                </span>
              </div>
            </div>
          </div>

          {/* Red Flags */}
          {report.redFlags && report.redFlags.length > 0 && (
            <div>
              <h3 className="text-xs font-mono uppercase text-slate-400 mb-2 font-bold">
                Account Red Flags Detected ({report.redFlags.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {report.redFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        {flag.signal}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{flag.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety Tips */}
          {report.safetyTips && report.safetyTips.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Recommended Interaction Safeguards
              </h4>
              <ul className="space-y-1 text-xs text-slate-300">
                {report.safetyTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Share Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              Instagram Forensics Powered by RiskProtector AI
            </span>
            <button
              onClick={() =>
                onShareReportToMobile({
                  type: 'instagram',
                  summary: report.profileSummary,
                  verdict: report.verdict,
                  riskScore: report.fakeProbability,
                  target: `@${lastScannedUsername}`,
                })
              }
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/40 text-pink-300 hover:text-pink-200 text-xs font-semibold transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Copy Instagram Audit to Mobile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
