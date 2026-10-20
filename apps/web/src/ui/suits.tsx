import type { Suit } from "../../../../packages/contracts/src/index.js";
export function SuitIcon({
  suit,
  className = "",
}: {
  suit: Suit;
  className?: string;
}) {
  return (
    <svg class={className} viewBox="0 0 40 40" aria-hidden="true" fill="none">
      <g stroke="currentColor" stroke-width="2.4" stroke-linejoin="round">
        {suit === "ember" ? (
          <>
            <path d="M20 3 32 18 27 33 20 37 9 25 11 14Z" />
            <path d="m20 12 5 10-5 9-5-9Z" />
          </>
        ) : suit === "claw" ? (
          <>
            <path d="m9 5 3 24 8 7 8-7 3-24-8 15-3-8-3 8Z" />
          </>
        ) : suit === "orbit" ? (
          <>
            <path d="m20 5 15 15-15 15L5 20Z" />
            <ellipse
              cx="20"
              cy="20"
              rx="18"
              ry="7"
              transform="rotate(-38 20 20)"
            />
            <circle cx="20" cy="20" r="3" fill="currentColor" />
          </>
        ) : (
          <>
            <path d="m5 12 7 19h8l-3-10 5-15 5 15 8-9-5 19h-6" />
            <path d="M12 36h18" />
          </>
        )}
      </g>
    </svg>
  );
}
