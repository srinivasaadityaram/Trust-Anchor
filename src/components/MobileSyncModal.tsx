import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Smartphone, Copy, Check, Share2, X, ShieldAlert, ArrowRight, QrCode } from 'lucide-react';

interface MobileSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportToShare?: {
    type: 'threat' | 'instagram' | 'camera';
    summary: string;
    verdict: string;
    riskScore: number;
    target: string;
  } | null;
}

export const MobileSyncModal: React.FC<MobileSyncModalProps> = ({
  isOpen,
  onClose,
  reportToShare,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      setCurrentUrl(url);
      QRCode.toDataURL(url, {
        width: 260,
        margin: 2,
        color: {
          dark: '#030712',
          light: '#38bdf8',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Trust Anchor -for stability and reliability',
          text: 'Trust Anchor -for stability and reliability. Scan URLs, verify products, and analyze social profiles in real time.',
          url: currentUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyReportToMobile = async () => {
    if (!reportToShare) return;
    const formatted = `🛡️ [Trust Anchor Security Advisory]
Target: ${reportToShare.target}
Verdict: ${reportToShare.verdict} (Risk: ${reportToShare.riskScore}%)
Summary: ${reportToShare.summary}
Scanned via Trust Anchor: ${currentUrl}`;

    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl shadow-cyan-950/50 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Sync / Copy to Mobile
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                PWA Ready
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Open instantly on your smartphone or copy security findings
            </p>
          </div>
        </div>

        {/* QR Code and Instructions */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-6">
          <div className="flex flex-col items-center">
            {qrCodeDataUrl ? (
              <div className="p-2 bg-slate-900 border border-cyan-500/40 rounded-xl shadow-lg relative group">
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code to open on mobile"
                  className="w-40 h-40 object-contain rounded-lg"
                />
                <div className="text-[10px] text-center text-cyan-400 font-mono mt-1 flex items-center justify-center gap-1">
                  <QrCode className="w-3 h-3" /> Point phone camera
                </div>
              </div>
            ) : (
              <div className="w-40 h-40 bg-slate-800 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-500">
                Generating QR...
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[11px] shrink-0">
                1
              </span>
              <span>Open your phone camera or QR scanner.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[11px] shrink-0">
                2
              </span>
              <span>Tap the yellow/cyan pop-up link to load RiskProtector.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[11px] shrink-0">
                3
              </span>
              <span>
                Use mobile camera for on-the-go suspicious letters &amp; QR checks.
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-sm font-medium text-slate-200 hover:text-white transition cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-cyan-400" />
                <span>Copy App URL</span>
              </>
            )}
          </button>

          <button
            onClick={handleShareNative}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-sm font-medium text-white transition shadow-lg shadow-cyan-950/60 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via Phone / App</span>
          </button>
        </div>

        {/* If there is a current report to share */}
        {reportToShare && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950/90 border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Active Threat Report Ready to Send</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">
                Risk: {reportToShare.riskScore}%
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2 mb-2 font-mono">
              Target: {reportToShare.target} — {reportToShare.verdict}
            </p>
            <button
              onClick={handleCopyReportToMobile}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs font-semibold text-amber-300 transition cursor-pointer"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Report Copied to Mobile Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copy Formatted Advisory for WhatsApp / SMS</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
