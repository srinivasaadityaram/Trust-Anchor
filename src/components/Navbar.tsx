import React from 'react';
import { Shield, Smartphone, QrCode, Instagram, Camera, Search, Radio, AlertOctagon } from 'lucide-react';

interface NavbarProps {
  activeTab: 'scanner' | 'instagram' | 'camera' | 'intel';
  setActiveTab: (tab: 'scanner' | 'instagram' | 'camera' | 'intel') => void;
  onOpenMobileSync: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileSync,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('scanner')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-indigo-500/20 border border-cyan-500/40 group-hover:border-cyan-400 transition shadow-lg shadow-cyan-950/50">
              <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition duration-300" />
              <div className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-sm group-hover:opacity-100 opacity-50 transition" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  RiskProtector
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                  AI CORE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide hidden sm:block">
                Cyber Threat &amp; Scam Shield
              </p>
            </div>
          </button>
        </div>

        {/* Navigation Tabs (Strictly no 'Safety Portals' or 'Spot the Scam') */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'scanner'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Universal Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('instagram')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'instagram'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Instagram className="w-3.5 h-3.5 text-pink-400" />
            <span>Instagram Fake / Real AI</span>
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Camera Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('intel')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'intel'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
            <span>Threat Intel</span>
          </button>
        </nav>

        {/* Right Actions: Mobile Sync & Live Status */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Engine: Online</span>
          </div>

          <button
            onClick={onOpenMobileSync}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-600/30 to-emerald-600/30 hover:from-cyan-500/40 hover:to-emerald-500/40 border border-cyan-500/40 text-cyan-200 hover:text-white text-xs font-semibold shadow-lg shadow-cyan-950/40 transition cursor-pointer group"
          >
            <Smartphone className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
            <span className="hidden sm:inline">Copy to Mobile</span>
            <span className="sm:hidden">Mobile</span>
            <QrCode className="w-3.5 h-3.5 text-cyan-400/80" />
          </button>
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="flex md:hidden items-center justify-around px-2 py-2 border-t border-slate-800/60 bg-slate-950/95 overflow-x-auto text-[11px]">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shrink-0 ${
            activeTab === 'scanner'
              ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
              : 'text-slate-400'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Scanner
        </button>
        <button
          onClick={() => setActiveTab('instagram')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shrink-0 ${
            activeTab === 'instagram'
              ? 'bg-pink-500/20 text-pink-300 font-semibold'
              : 'text-slate-400'
          }`}
        >
          <Instagram className="w-3.5 h-3.5 text-pink-400" />
          Instagram AI
        </button>
        <button
          onClick={() => setActiveTab('camera')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shrink-0 ${
            activeTab === 'camera'
              ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
              : 'text-slate-400'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-emerald-400" />
          Camera HUD
        </button>
        <button
          onClick={() => setActiveTab('intel')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shrink-0 ${
            activeTab === 'intel'
              ? 'bg-amber-500/20 text-amber-300 font-semibold'
              : 'text-slate-400'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
          Intel
        </button>
      </div>
    </header>
  );
};
