"use client";

import { motion } from "framer-motion";

const COLORS = ["#ffd23f", "#ff4d8d", "#2dd4bf", "#a855f7", "#ffffff"];
const PIECE_COUNT = 28;

interface Piece {
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotate: number;
  size: number;
}

/** Deterministic pseudo-random in [0, 1) from a seed — keeps render pure. */
function seeded(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

/** Confetti pieces derived purely from their index (no Math.random, no state). */
const PIECES: Piece[] = Array.from({ length: PIECE_COUNT }, (_, index) => ({
  left: (index / PIECE_COUNT) * 100 + (seeded(index) * 6 - 3),
  delay: seeded(index + 1) * 0.4,
  duration: 1.6 + seeded(index + 2) * 1.2,
  color: COLORS[index % COLORS.length] ?? "#ffffff",
  rotate: seeded(index + 3) * 360,
  size: 8 + seeded(index + 4) * 8,
}));

/** Decorative confetti burst that rains once when mounted. Purely cosmetic. */
export function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {PIECES.map((piece, index) => (
        <motion.span
          key={index}
          initial={{ y: "-10vh", opacity: 1, rotate: piece.rotate }}
          animate={{ y: "110vh", opacity: [1, 1, 0], rotate: piece.rotate + 360 }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "easeIn",
          }}
          style={{
            position: "absolute",
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
