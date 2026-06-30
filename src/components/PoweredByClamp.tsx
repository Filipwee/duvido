/**
 * "Powered by Clamp" endorsement. Clamp acquired Duvido; this is the studio's
 * signature. Links to clamp.digital.
 *
 * - `PoweredByClamp` — inline "Ink" lockup, used in the landing footer.
 * - `PoweredByClampFloating` — fixed glass corner tag, visible on every screen.
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

/** Inline credit for the landing footer. */
export function PoweredByClamp() {
  return (
    <a
      href={CLAMP_URL}
      target="_blank"
      rel="noopener"
      aria-label="Powered by Clamp — clamp.digital"
      className="inline-flex items-center gap-2 no-underline opacity-70 transition-opacity hover:opacity-100"
    >
      <span className="font-mono text-[11px] tracking-[0.22em] text-white/60 uppercase">
        powered by
      </span>
      <ClampMark size={15} />
      <span className="font-heading text-[15px] font-bold tracking-tight text-white">Clamp</span>
    </a>
  );
}

/** Fixed glass corner tag, pinned bottom-right above all screens. */
export function PoweredByClampFloating() {
  return (
    <a
      href={CLAMP_URL}
      target="_blank"
      rel="noopener"
      aria-label="Powered by Clamp — clamp.digital"
      className="fixed right-4 bottom-4 z-50 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#14161B]/70 px-3 py-1.5 no-underline backdrop-blur-md transition-colors hover:bg-[#14161B]/90"
    >
      <ClampMark size={13} />
      <span className="font-mono text-[10px] tracking-[0.12em] text-white/75">
        by <span className="font-semibold text-white">Clamp</span>
      </span>
    </a>
  );
}
