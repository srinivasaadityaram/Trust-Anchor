import React from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  Smartphone,
  ExternalLink,
  Lock,
  Globe,
  Radio,
  Share2,
} from 'lucide-react';

interface ThreatIntelFeedProps {
  onScanSample: (text: string) => void;
  onOpenMobileSync: () => void;
}

const ACTIVE_CAMPAIGNS = [
  {
    title: 'Postal Service Smishing Wave (USPS / Royal Mail / AusPost)',
    severity: 'CRITICAL',
    vector: 'SMS / iMessage',
    target: 'Mobile Users',
    description:
      'Widespread smishing texts claiming an undeliverable package due to "incomplete street number". Victims directed to typosquat domains (.top, .xyz, .cfd) requesting a $0.30 redelivery fee to harvest credit card credentials.',
    sample: 'USPS: We could not deliver your parcel #94001009 due to invalid street address. Please update within 24h at http://usps-postal-verify.top',
  },
  {
    title: 'Instagram "Account Disabled for Copyright" Phishing',
    severity: 'HIGH',
    vector: 'Instagram DMs & Bio Links',
    target: 'Creators & Small Businesses',
    description:
      'Impersonation accounts disguised as Meta Support DMing users claiming their account violates trademark policies. Provides a form link capturing passwords and 2FA recovery backup codes.',
    sample: 'Meta Support: Your profile was flagged for trademark infringement. Appeal within 48h to prevent account termination: https://meta-appeal-form-case29.cc',
  },
  {
    title: 'Quishing: Malicious QR Codes on Parking Meters & Invoices',
    severity: 'HIGH',
    vector: 'Physical Sticker & PDF Invoices',
    target: 'Drivers & Finance Teams',
    description:
      'Fraudulent QR code stickers pasted over legitimate parking payment meters or embedded into invoice emails. Bypasses email gateway filters because URLs are encoded visually inside images.',
    sample: 'Scan QR to pay parking space #44 - secure payment portal: https://quickpark-pay-session.link/meter',
  },
  {
    title: 'AI Voice Cloning & Emergency Family Distress Scams',
    severity: 'CRITICAL',
    vector: 'Phone Calls & WhatsApp Audio',
    target: 'Families & Elders',
    description:
      'Scammers use 3-second audio samples from TikTok/Instagram to clone a family member’s voice, claiming they were in a car accident or arrested and urgently demand crypto or wire transfers.',
    sample: 'Mom, I got into an accident and my phone broke. Please wire $1,500 to my friend’s account immediately.',
  },
];

export const ThreatIntelFeed: React.FC<ThreatIntelFeedProps> = ({
  onScanSample,
  onOpenMobileSync,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono mb-3">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Real-Time Threat Intelligence &amp; Advisory Feed</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2">
          Global Cyber Scam Threat Advisory
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Active deceptive campaigns tracked by global CERTs and AI defense sensors. Click any sample campaign to analyze it in the universal scanner.
        </p>
      </div>

      {/* Grid of Threat Campaigns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {ACTIVE_CAMPAIGNS.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    item.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {item.severity} SEVERITY
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Vector: {item.vector}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-2">
                {item.title}
              </h3>

              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                {item.description}
              </p>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 mb-4">
                <span className="text-[10px] font-mono text-slate-500 block mb-1">
                  Observed Bait Syntax:
                </span>
                <p className="text-xs text-rose-300 font-mono break-all line-clamp-2">
                  "{item.sample}"
                </p>
              </div>
            </div>

            <button
              onClick={() => onScanSample(item.sample)}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-cyan-500/40 text-xs font-semibold text-cyan-300 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Test &amp; Inspect in Universal Scanner</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Emergency Reporting & Cyber Hygiene Guide */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
        <h3 className="text-sm font-mono uppercase text-cyan-400 font-bold mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Official Cyber Emergency Incident Reporting Channels
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 mb-4">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="font-bold text-white block mb-1">United States (FBI IC3)</span>
            <p className="text-[11px] text-slate-400">
              Report Internet Crime &amp; Wire Fraud at <strong>ic3.gov</strong> or report phishing to <strong>reportphishing@apwg.org</strong>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="font-bold text-white block mb-1">United Kingdom (Action Fraud)</span>
            <p className="text-[11px] text-slate-400">
              Forward scam SMS texts to <strong>7726</strong> (SPAM) and email reports to <strong>report@phishing.gov.uk</strong>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="font-bold text-white block mb-1">International &amp; CERT</span>
            <p className="text-[11px] text-slate-400">
              Google Safe Browsing &amp; CISA incident response at <strong>safebrowsing.google.com/report_phish</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Keep this defense terminal accessible anywhere on your smartphone.
          </span>
          <button
            onClick={onOpenMobileSync}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-semibold cursor-pointer transition"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Generate Phone QR &amp; Sync to Mobile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
