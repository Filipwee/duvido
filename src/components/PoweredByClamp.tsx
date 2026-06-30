"use client";

import * as React from "react";
import { X } from "lucide-react";

/**
 * "Powered by Clamp" endorsement. Clamp acquired Duvido; this is the studio's
 * signature. Links to clamp.digital.
 *
 * - `PoweredByClamp` — prominent inline lockup, used in the landing footer.
 * - `PoweredByClampFloating` — fixed corner tag visible during the game, with
 *   a minimize toggle that collapses it to just the logo.
 *
 * The symbol's node is always Clamp Blue (#2B54F4). Self-contained SVG so it
 * renders without the brand fonts loaded — falls back to the app's faces.
 */

const CLAMP_URL = "https://clamp.digital";

/** The Clamp symbol: a "C" arc with a square node. */
function ClampMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className="block"
    >
      <path d="M71 20 A37 37 0 1 0 71 80" stroke="#F4F1EA" strokeWidth="15" strokeLinecap="round" />
      <rect x="60" y="41" width="18" height="18" rx="3" fill="#2B54F4" />
    </svg>
  );
}

/** Inline credit for the landing footer — a prominent glass pill. */
export function PoweredByClamp() {
  return (
    <a
      href={CLAMP_URL}
      target="_blank"
      rel="noopener"
      aria-label="Powered by Clamp — clamp.digital"
      className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 no-underline shadow-lg backdrop-blur-sm transition-colors hover:bg-white/15"
    >
      <span className="font-mono text-xs tracking-[0.22em] text-white/75 uppercase">
        powered by
      </span>
      <ClampMark size={18} />
      <span className="font-heading text-lg font-bold tracking-tight text-white">Clamp</span>
    </a>
  );
}

/** Fixed corner tag during the game, collapsible to just the logo. */
export function PoweredByClampFloating() {
  const [collapsed, setCollapsed] = React.useState(false);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        aria-label="Mostrar crédito Clamp"
        className="fixed right-4 bottom-4 z-50 flex size-8 items-center justify-center rounded-full border border-white/15 bg-[#14161B]/70 backdrop-blur-md transition-colors hover:bg-[#14161B]/90"
      >
        <ClampMark size={14} />
      </button>
    );
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex items-center gap-1 rounded-lg border border-white/15 bg-[#14161B]/70 py-1.5 pr-1 pl-3 backdrop-blur-md">
      <a
        href={CLAMP_URL}
        target="_blank"
        rel="noopener"
        aria-label="Powered by Clamp — clamp.digital"
        className="inline-flex items-center gap-1.5 no-underline"
      >
        <span className="font-mono text-[10px] tracking-[0.12em] text-white/75">
          by <span className="font-semibold text-white">Clamp</span>
        </span>
        <ClampMark size={13} />
      </a>
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        aria-label="Minimizar crédito Clamp"
        className="flex size-5 items-center justify-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    </div>
  );
}
