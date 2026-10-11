/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  QrCode,
  Sun,
  Moon,
  Menu,
  X,
  ArrowLeft,
  Smartphone,
  ExternalLink,
  Lock,
  Globe,
  Camera,
  Instagram,
  AlertOctagon,
  CheckCircle,
} from 'lucide-react';

import { OrbitHub } from './components/OrbitHub';
import { ScanWebsite } from './components/ScanWebsite';
import { FakeVsRealBrands } from './components/FakeVsRealBrands';
import { FakeVsRealApps } from './components/FakeVsRealApps';
import { SocialMediaCheck } from './components/SocialMediaCheck';
import { ThreatIntelFeed } from './components/ThreatIntelFeed';
import { CameraScanner } from './components/CameraScanner';
import { MobileSyncModal } from './components/MobileSyncModal';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<string>('hub');
  const [theme, setTheme] = useState<'dark' | 'light' | 'midnight'>('dark');
  const [xp, setXp] = useState<number>(450);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState<boolean>(false);

  const [reportToShare, setReportToShare] = useState<{
    type: 'threat' | 'instagram' | 'camera';
    summary: string;
    verdict: string;
    riskScore: number;
    target: string;
  } | null>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', !isLight);
  }, [isLight]);

  const handleCycleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : prev === 'light' ? 'midnight' : 'dark'));
  };

  const handleAddXp = (amount: number) => {
    setXp((prev) => prev + amount);
  };

  const handleShareReportToMobile = (report: {
    type: 'threat' | 'instagram' | 'camera';
    summary: string;
    verdict: string;
    riskScore: number;
    target: string;
  }) => {
    setReportToShare(report);
    setIsMobileModalOpen(true);
  };

  // Theme background styles from the original website
  const themeBgStyle =
    theme === 'light'
      ? 'bg-slate-50 bg-[radial-gradient(circle_at_50%_45%,rgba(14,165,233,0.16),rgba(248,250,252,0.98)_65%)] text-slate-900'
      : theme === 'midnight'
      ? 'bg-slate-900 bg-[radial-gradient(circle_at_50%_48%,rgba(56,189,248,0.12),rgba(15,23,42,0.98)_65%)] text-slate-100'
      : 'bg-[#0B0F17] bg-[radial-gradient(circle_at_50%_48%,rgba(14,165,233,0.10),rgba(11,15,23,0.98)_65%)] text-slate-100';

  const navButtonBorder = isLight
    ? 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 shadow-sm'
    : 'border-slate-700/90 bg-slate-900/90 hover:bg-slate-800 text-slate-200';

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between transition-colors duration-300 select-none ${themeBgStyle}`}>
      {/* Top Header */}
      <header className="w-full px-4 sm:px-8 pt-4 pb-2 flex items-center justify-between relative z-40">
        {/* Left: Scan QR / Product Button */}
        <button
          type="button"
          onClick={() => {
            setActiveScreen('qr-scanner');
            setIsMenuOpen(false);
          }}
          className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            isLight
              ? 'border-cyan-500/60 bg-white hover:bg-cyan-50 text-cyan-700 shadow-sm'
              : 'border-cyan-400/50 bg-slate-900/90 hover:bg-cyan-500/20 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.18)]'
          }`}
          title="Scan a QR Code or Product Barcode"
        >
          <QrCode className={`w-4 h-4 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
          <span>Scan QR / Product</span>
        </button>

        {/* Center: Brand Title */}
        {activeScreen === 'hub' ? (
          <div className="flex flex-col items-center text-center px-2 cursor-pointer" onClick={() => setActiveScreen('hub')}>
            <h1
              className={`text-base sm:text-2xl md:text-3xl font-extrabold tracking-wider uppercase ${
                isLight
                  ? 'text-slate-900 drop-shadow-sm'
                  : 'text-white drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]'
              }`}
            >
              Trust Anchor
            </h1>
            <span className="text-[11px] sm:text-xs text-cyan-400 font-medium tracking-wide">
              — for stability and reliability
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveScreen('hub')}>
            <Shield className="w-5 h-5 text-amber-400" />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase leading-tight">
                Trust Anchor
              </span>
              <span className="text-[10px] text-cyan-400 font-medium hidden sm:block leading-tight">
                — for stability and reliability
              </span>
            </div>
          </div>
        )}

        {/* Right Actions: Theme, Mobile Sync, Menu */}
        <div className="flex items-center gap-2 relative">
          {/* Theme switcher */}
          <button
            type="button"
            onClick={handleCycleTheme}
            className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${navButtonBorder}`}
            title="Switch Theme (Dark / Light / Midnight)"
          >
            {isLight ? (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-cyan-300" />
                <span className="hidden sm:inline capitalize">{theme}</span>
              </>
            )}
          </button>

          {/* Copy to Mobile Button */}
          <button
            type="button"
            onClick={() => setIsMobileModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              isLight
                ? 'border-cyan-500/40 bg-white hover:bg-cyan-50 text-cyan-700 shadow-sm'
                : 'border-cyan-500/40 bg-slate-900/90 hover:bg-slate-800 text-cyan-300'
            }`}
            title="Copy / Sync to Mobile"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Mobile</span>
          </button>

          {/* Menu Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${navButtonBorder}`}
            aria-label="Open menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div
              className={`absolute right-0 top-12 w-64 rounded-2xl border backdrop-blur-md shadow-2xl p-2 z-50 space-y-1 text-xs animate-fade-in ${
                isLight ? 'border-slate-200 bg-white/95 text-slate-800' : 'border-slate-800 bg-slate-900/95 text-slate-200'
              }`}
            >
              <button
                onClick={() => {
                  setActiveScreen('hub');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800/40 text-left font-semibold cursor-pointer"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Trust Anchor Orbit Hub</span>
              </button>

              <button
                onClick={() => {
                  setActiveScreen('scan-website');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800/40 text-left cursor-pointer"
              >
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Scan Website &amp; Link</span>
              </button>

              <button
                onClick={() => {
                  setActiveScreen('social-check');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800/40 text-left cursor-pointer"
              >
                <Instagram className="w-4 h-4 text-fuchsia-400" />
                <span>Social Media &amp; Instagram Check</span>
              </button>

              <button
                onClick={() => {
                  setActiveScreen('fake-vs-real-brands');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800/40 text-left cursor-pointer"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Fake vs Real Brands (Photo Check)</span>
              </button>

              <button
                onClick={() => {
                  setActiveScreen('fake-vs-real-apps');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800/40 text-left cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Fake vs Real Apps &amp; APKs</span>
              </button>

              <button
                onClick={() => {
                  setActiveScreen('threat-intel');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800/40 text-left cursor-pointer"
              >
                <AlertOctagon className="w-4 h-4 text-orange-400" />
                <span>Threat Intelligence Feed</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800/40 text-left font-semibold text-cyan-400 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Sync / Copy to Mobile</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main View Area */}
      {activeScreen === 'hub' ? (
        <OrbitHub
          isLight={isLight}
          onNavigate={(screenId) => {
            if (screenId === 'mobile-sync') {
              setIsMobileModalOpen(true);
            } else {
              setActiveScreen(screenId);
            }
          }}
          onAddXp={handleAddXp}
          onShareReportToMobile={handleShareReportToMobile}
        />
      ) : (
        <main className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-2 max-w-4xl mx-auto w-full space-y-5 select-text">
          {/* Subview Navigation Header: "Back to Main Shield" */}
          <div className="w-full flex items-center justify-between">
            <button
              onClick={() => setActiveScreen('hub')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isLight
                  ? 'border-slate-300 bg-white hover:bg-slate-100 text-cyan-700 shadow-sm'
                  : 'border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-cyan-300'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Trust Anchor</span>
            </button>
          </div>

          {/* Subview Components */}
          {activeScreen === 'scan-website' && (
            <ScanWebsite
              isLight={isLight}
              onAddXp={handleAddXp}
              onShareReportToMobile={handleShareReportToMobile}
            />
          )}

          {activeScreen === 'fake-vs-real-brands' && (
            <FakeVsRealBrands
              isLight={isLight}
              onAddXp={handleAddXp}
              onOpenLiveCamera={() => setActiveScreen('qr-scanner')}
              onShareReportToMobile={handleShareReportToMobile}
            />
          )}

          {activeScreen === 'fake-vs-real-apps' && (
            <FakeVsRealApps
              isLight={isLight}
              onAddXp={handleAddXp}
              onShareReportToMobile={handleShareReportToMobile}
            />
          )}

          {activeScreen === 'social-check' && (
            <SocialMediaCheck
              isLight={isLight}
              onAddXp={handleAddXp}
              onShareReportToMobile={handleShareReportToMobile}
            />
          )}

          {activeScreen === 'threat-intel' && (
            <ThreatIntelFeed
              onScanSample={(sampleText) => {
                setActiveScreen('scan-website');
              }}
              onOpenMobileSync={() => setIsMobileModalOpen(true)}
            />
          )}

          {activeScreen === 'qr-scanner' && (
            <CameraScanner onShareReportToMobile={handleShareReportToMobile} />
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/60 py-4 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 relative z-30">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span className={isLight ? 'text-slate-700' : 'text-slate-400'}>
            Trust Anchor — for stability and reliability
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono">
          <button
            onClick={() => setIsMobileModalOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-semibold"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Copy / Scan on Mobile</span>
          </button>
        </div>
      </footer>

      {/* Mobile QR & Sync Modal */}
      <MobileSyncModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        reportToShare={reportToShare}
      />
    </div>
  );
}
