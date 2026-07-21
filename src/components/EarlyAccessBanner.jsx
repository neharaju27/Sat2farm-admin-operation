import { Info } from 'lucide-react';

export default function EarlyAccessBanner({ className = "" }) {
  return (
    <div className={`w-full bg-gradient-to-r from-slate-900/95 via-indigo-950/95 to-slate-900/95 border-b border-indigo-500/30 text-white relative z-50 overflow-hidden shadow-lg backdrop-blur-md ${className}`}>
      {/* Background decorative subtle lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:20px_20px] opacity-25"></div>

      {/* Self-contained high-performance linear snake-game wrap-around marquee style */}
      <style>{`
        @keyframes banner-marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .banner-marquee-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: banner-marquee 25s linear infinite;
        }
        .banner-marquee-item {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          white-space: nowrap;
          padding-right: 80px; /* Space between loops to prevent collapsing/collision */
        }
      `}</style>

      <div className="relative z-10 py-2.5 overflow-hidden flex items-center">
        <div className="banner-marquee-track">
          {/* Group 1 */}
          <div className="banner-marquee-item">
            <div className="flex items-center gap-3 whitespace-nowrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider whitespace-nowrap">
                Early Access
              </span>
              <span className="text-sm font-medium text-slate-200 whitespace-nowrap">
                You are currently using the Early Access version. Please share your feedback, suggestions, or any issues with the respective POC.
              </span>
              <Info className="w-4 h-4 text-indigo-400 ml-1 flex-shrink-0" />
            </div>
          </div>

          {/* Group 2 (Duplicate for snake game wrap-around wrap effect) */}
          <div className="banner-marquee-item" aria-hidden="true">
            <div className="flex items-center gap-3 whitespace-nowrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider whitespace-nowrap">
                Early Access
              </span>
              <span className="text-sm font-medium text-slate-200 whitespace-nowrap">
                You are currently using the Early Access version. Please share your feedback, suggestions, or any issues with the respective POC.
              </span>
              <Info className="w-4 h-4 text-indigo-400 ml-1 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
      {/* Glow highlight line on the bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"></div>
    </div>
  );
}
