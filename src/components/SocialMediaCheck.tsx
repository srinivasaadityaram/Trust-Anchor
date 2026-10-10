import React, { useState } from 'react';
import {
  Instagram,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Share2,
  Copy,
  Check,
  Shield,
  ArrowRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { OFFICIAL_BRANDS, OfficialBrand } from '../data/brands';

interface SocialMediaCheckProps {
  isLight: boolean;
  onAddXp: (amount: number) => void;
  onShareReportToMobile: (report: {
    type: 'instagram';
    summary: string;
    verdict: string;
    riskScore: number;
    target: string;
  }) => void;
}

export interface SocialCheckResult {
  givenNameOrLink: string;
  originalName: string;
  originalOfficialLink: string;
  originalPublisher: string;
  category: string;
  verdict: 'ORIGINAL (REAL)' | 'FAKE / LOOK-ALIKE' | 'SUSPICIOUS';
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  simpleExplanation: string;
  differences: {
    feature: string;
    originalOfficial: string;
    givenInput: string;
    status: 'match' | 'mismatch' | 'warning';
  }[];
  aiBioScore?: number;
  aiBioRedirection?: boolean;
}

const PRESET_HANDLES = [
  { label: '🚨 Fake SBI Support', handle: '@sbi_helpdesk_care' },
  { label: '⚠️ Fake Apple Recovery', handle: 'instagram.com/apple_support_24x7' },
  { label: '🤖 Crypto Impersonator', handle: '@elon_solana_airdrop99' },
  { label: '✅ Real SBI Official', handle: '@onlinesbi' },
  { label: '✅ Real Instagram Profile', handle: '@instagram' },
];

export const SocialMediaCheck: React.FC<SocialMediaCheckProps> = ({
  isLight,
  onAddXp,
  onShareReportToMobile,
}) => {
  const [handleInput, setHandleInput] = useState<string>('@sbi_helpdesk_care');
  const [result, setResult] = useState<SocialCheckResult | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Optional AI Deep Profile inputs
  const [showAdvancedBio, setShowAdvancedBio] = useState(false);
  const [bioInput, setBioInput] = useState<string>('');
  const [followersInput, setFollowersInput] = useState<string>('');
  const [followingInput, setFollowingInput] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const evaluateSocialHandle = (rawInput: string): SocialCheckResult => {
    const input = rawInput.trim();
    const cleanLower = input
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/^(instagram\.com|x\.com|twitter\.com|facebook\.com|t\.me)\//i, '@')
      .replace(/\/+$/, '');

    const handleOnly = cleanLower.startsWith('@') ? cleanLower : `@${cleanLower}`;
    const handleWithoutAt = handleOnly.slice(1);

    // 1. Detect matching brand
    const matchedBrand = OFFICIAL_BRANDS.find((brand) => {
      return (
        brand.keywords.some((kw) => handleWithoutAt.includes(kw)) ||
        handleWithoutAt.includes(brand.id) ||
        (brand.officialHandle && brand.officialHandle.toLowerCase().includes(handleWithoutAt))
      );
    });

    // 2. Scam lure words
    const lureRegex = /(support|help|helpdesk|care|customercare|service|recovery|refund|claim|prize|giveaway|airdrop|verify|verification|apk|mod|admin|team|hq|officials)/i;
    const hasLure = lureRegex.test(handleWithoutAt);

    // 3. Tricks & substitutions
    const hasNumberSubstitutions = /[0-9]/.test(handleWithoutAt);
    const hasExcessiveSeparators = /[-_.]{2,}/.test(handleWithoutAt) || (handleWithoutAt.match(/[-_.]/g) || []).length >= 2;

    const differences: SocialCheckResult['differences'] = [];

    if (matchedBrand) {
      const isOfficialMatch =
        handleOnly.toLowerCase() === matchedBrand.officialHandle.toLowerCase() ||
        handleWithoutAt === matchedBrand.id;

      differences.push({
        feature: 'Handle / Account Name',
        originalOfficial: `${matchedBrand.officialHandle} (Official Verified Handle)`,
        givenInput: handleOnly,
        status: isOfficialMatch ? 'match' : 'mismatch',
      });

      differences.push({
        feature: 'Support / Lure Trap Words',
        originalOfficial: 'No DM-for-refund or helpdesk trap words',
        givenInput: hasLure ? 'Contains high-risk lure words (support / helpdesk / care / refund / airdrop)' : 'No trap words detected',
        status: hasLure ? 'mismatch' : 'match',
      });

      differences.push({
        feature: 'Number / Symbol Tricks',
        originalOfficial: 'Clean official syntax',
        givenInput: hasNumberSubstitutions
          ? 'Contains numbers mixed into brand name'
          : hasExcessiveSeparators
          ? 'Contains suspicious multiple underscores/dashes'
          : 'Clean syntax format',
        status: hasNumberSubstitutions || hasExcessiveSeparators ? 'mismatch' : 'match',
      });

      if (isOfficialMatch) {
        return {
          givenNameOrLink: input,
          originalName: matchedBrand.name,
          originalOfficialLink: matchedBrand.primaryOfficialUrl,
          originalPublisher: matchedBrand.officialPublisher,
          category: matchedBrand.category,
          verdict: 'ORIGINAL (REAL)',
          riskLevel: 'Low Risk',
          simpleExplanation: `"${input}" matches the official recognized handle (${matchedBrand.officialHandle}) for ${matchedBrand.name}. Always confirm the verified blue badge before sending sensitive info.`,
          differences,
        };
      } else {
        return {
          givenNameOrLink: input,
          originalName: matchedBrand.name,
          originalOfficialLink: matchedBrand.primaryOfficialUrl,
          originalPublisher: matchedBrand.officialPublisher,
          category: matchedBrand.category,
          verdict: 'FAKE / LOOK-ALIKE',
          riskLevel: 'High Risk',
          simpleExplanation: `Warning! "${input}" shows classic signs of a fake impersonation or scam support account targeting ${matchedBrand.name}. Scammers frequently create fake handles like this to trick victims into sharing OTPs, passwords, or sending payment refunds via DM. The real official handle is ${matchedBrand.officialHandle}.`,
          differences,
        };
      }
    }

    // Generic handle evaluation (not in official brands database)
    const isSuspicious = hasLure || hasExcessiveSeparators || (hasNumberSubstitutions && handleWithoutAt.length > 12);

    differences.push({
      feature: 'Handle / Account Structure',
      originalOfficial: 'Clean personal or brand handle',
      givenInput: handleOnly,
      status: isSuspicious ? 'warning' : 'match',
    });

    differences.push({
      feature: 'Support / Lure Trap Words',
      originalOfficial: 'No scam bait words',
      givenInput: hasLure ? 'Contains lure words (support / helpdesk / care / claim / airdrop)' : 'No lure words detected',
      status: hasLure ? 'mismatch' : 'match',
    });

    differences.push({
      feature: 'Formatting & Separators',
      originalOfficial: 'Standard account handle syntax',
      givenInput: hasExcessiveSeparators ? 'Multiple hyphens/underscores' : 'Standard formatting',
      status: hasExcessiveSeparators ? 'warning' : 'match',
    });

    if (isSuspicious) {
      return {
        givenNameOrLink: input,
        originalName: handleOnly,
        originalOfficialLink: 'Unverified Third-Party Profile',
        originalPublisher: 'Unknown Operator',
        category: 'Social Media Profile Check',
        verdict: 'FAKE / LOOK-ALIKE',
        riskLevel: 'High Risk',
        simpleExplanation: `Warning! "${input}" exhibits high-risk signals commonly used by impersonators (such as adding customer-care or helpdesk lure words, or artificial number patterns). Do not click mystery links in their bio or transfer funds.`,
        differences,
      };
    }

    return {
      givenNameOrLink: input,
      originalName: handleOnly,
      originalOfficialLink: `https://instagram.com/${handleWithoutAt}`,
      originalPublisher: handleOnly,
      category: 'Social Media Profile Check',
      verdict: 'ORIGINAL (REAL)',
      riskLevel: 'Low Risk',
      simpleExplanation: `"${input}" uses a standard handle structure without typical fake support lures (like "_customercare", "_refund", or suspicious symbols). Still verify account age and mutual connections.`,
      differences,
    };
  };

  const handleRunCheck = async (e?: React.FormEvent, overrideHandle?: string) => {
    if (e) e.preventDefault();
    const target = (overrideHandle !== undefined ? overrideHandle : handleInput).trim();
    if (!target) return;

    // 1. Run deterministic rule-based evaluation immediately
    let initialResult = evaluateSocialHandle(target);

    // 2. If user also provided bio/metrics or clicked deep AI check, query Gemini
    if (bioInput.trim() || followersInput.trim() || showAdvancedBio) {
      setIsAiLoading(true);
      try {
        const response = await fetch('/api/scan-instagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: target,
            bio: bioInput,
            followers: followersInput,
            following: followingInput,
            posts: '1',
            isVerified: false,
          }),
        });
        if (response.ok) {
          const aiData = await response.json();
          if (aiData.report) {
            const r = aiData.report;
            if (r.fakeProbability >= 60) {
              initialResult.verdict = 'FAKE / LOOK-ALIKE';
              initialResult.riskLevel = 'High Risk';
            }
            initialResult.simpleExplanation += ` [AI Forensic Bio Scan]: ${r.profileSummary}`;
            initialResult.aiBioScore = r.fakeProbability;
            initialResult.aiBioRedirection = r.bioAnalysis?.offPlatformRedirection;

            if (r.bioAnalysis?.suspiciousPatternsFound?.length > 0) {
              initialResult.differences.push({
                feature: 'AI Bio Forensic Analysis',
                originalOfficial: 'Clean personal / brand bio',
                givenInput: r.bioAnalysis.suspiciousPatternsFound.join(', '),
                status: 'mismatch',
              });
            }
          }
        }
      } catch (err) {
        console.warn('AI scan error fallback:', err);
      } finally {
        setIsAiLoading(false);
      }
    }

    setResult(initialResult);
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
    <div className={`w-full rounded-2xl border border-fuchsia-500/40 p-6 sm:p-8 space-y-6 ${cardStyle}`}>
      {/* Title */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-pulse" />
          <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-fuchsia-700' : 'text-fuchsia-400'}`}>
            SOCIAL MEDIA &amp; INSTAGRAM ACCOUNT DETECTOR
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Check If a Social Media Account or Handle Is Real or Fake
        </h1>
        <p className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          Enter any social media handle or profile link claiming to be customer support, a bank helpdesk, an influencer, or an official brand. Detects impersonators, look-alike lure words, and suspicious bio bot patterns.
        </p>
      </div>

      {/* Preset Quick Test Buttons */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono text-slate-400 font-semibold uppercase">
          Quick Test Samples:
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_HANDLES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setHandleInput(preset.handle);
                handleRunCheck(undefined, preset.handle);
              }}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                isLight
                  ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'
                  : 'border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={(e) => handleRunCheck(e)} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
              @
            </span>
            <input
              type="text"
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              placeholder="Enter handle or link (e.g. @sbi_helpdesk_care or instagram.com/...)"
              className={`w-full border rounded-xl pl-8 pr-4 py-3.5 text-sm focus:outline-none focus:border-fuchsia-400 font-mono ${inputStyle}`}
            />
          </div>

          <button
            type="submit"
            disabled={isAiLoading}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400 text-slate-950 font-bold text-xs shadow-lg shadow-fuchsia-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isAiLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Check Handle</span>
              </>
            )}
          </button>
        </div>

        {/* Optional Expand: Advanced Instagram Profile & Bio Analysis */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvancedBio(!showAdvancedBio)}
            className={`text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              isLight ? 'text-fuchsia-700 hover:text-fuchsia-800' : 'text-fuchsia-400 hover:text-fuchsia-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showAdvancedBio ? 'Hide' : 'Add'} Bio Text &amp; Follower Engagement Analysis (AI Detection)</span>
          </button>

          {showAdvancedBio && (
            <div className={`mt-3 p-4 rounded-xl border space-y-3 animate-fade-in ${innerCardStyle}`}>
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Profile Bio Description (detects WhatsApp/Telegram off-platform links):
                </label>
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Paste profile bio text here (e.g. 'DM for WhatsApp investment, certified trader...')"
                  rows={2}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:border-fuchsia-400 ${inputStyle}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">
                    Follower Count:
                  </label>
                  <input
                    type="text"
                    value={followersInput}
                    onChange={(e) => setFollowersInput(e.target.value)}
                    placeholder="e.g. 120"
                    className={`w-full border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-fuchsia-400 ${inputStyle}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">
                    Following Count:
                  </label>
                  <input
                    type="text"
                    value={followingInput}
                    onChange={(e) => setFollowingInput(e.target.value)}
                    placeholder="e.g. 4,800"
                    className={`w-full border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-fuchsia-400 ${inputStyle}`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Results Display */}
      {result && (
        <div className={`p-6 rounded-2xl border space-y-5 animate-fade-in ${innerCardStyle}`}>
          {/* Header Verdict Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/40">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  result.riskLevel === 'Low Risk'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {result.riskLevel === 'Low Risk' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <UserX className="w-6 h-6" />
                )}
              </div>
              <div>
                <div
                  className={`text-xs font-bold uppercase tracking-wider ${
                    result.riskLevel === 'Low Risk'
                      ? isLight ? 'text-emerald-700' : 'text-emerald-400'
                      : isLight ? 'text-rose-700' : 'text-rose-400'
                  }`}
                >
                  Result: {result.verdict} ({result.riskLevel})
                </div>
                <div className="text-base font-bold text-slate-100">
                  Target Account: {result.givenNameOrLink}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onShareReportToMobile({
                    type: 'instagram',
                    summary: result.simpleExplanation,
                    verdict: result.verdict,
                    riskScore: result.riskLevel === 'High Risk' ? 88 : 12,
                    target: result.givenNameOrLink,
                  })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-fuchsia-500/40 text-fuchsia-300 text-xs font-semibold hover:bg-fuchsia-500/20 transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy to Mobile</span>
              </button>
            </div>
          </div>

          {/* Simple Explanation */}
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
              Official Intelligence Analysis:
            </div>
            <p className="text-sm leading-relaxed text-slate-200">
              {result.simpleExplanation}
            </p>
          </div>

          {/* Differences / Forensic Audit Table */}
          {result.differences && result.differences.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-slate-400 font-semibold">
                Forensic Indicators Breakdown:
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b border-slate-700/50 ${isLight ? 'bg-slate-200/80 text-slate-700' : 'bg-slate-950 text-slate-400'}`}>
                    <tr>
                      <th className="p-3">Feature Checked</th>
                      <th className="p-3">Official Security Standard</th>
                      <th className="p-3">Given Account Input</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {result.differences.map((diff, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="p-3 font-semibold text-slate-200">{diff.feature}</td>
                        <td className="p-3 text-slate-400">{diff.originalOfficial}</td>
                        <td className="p-3 font-mono text-slate-300">{diff.givenInput}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              diff.status === 'match'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : diff.status === 'warning'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {diff.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Safety Recommendation Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/70 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Safety Action Protocol:
            </span>
            <p>
              {result.riskLevel === 'High Risk'
                ? 'Do not reply to messages, do not click links in the bio, and never provide bank OTPs, login passwords, or UPI pins. Report the account directly to the platform.'
                : 'Account matches verified patterns. Always ensure you are communicating through official secure in-app channels before performing transactions.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
