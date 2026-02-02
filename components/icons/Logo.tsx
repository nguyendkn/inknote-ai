interface LogoProps {
  className?: string;
}

export function Logo({ className = "w-6 h-6" }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Pen Nib Outline */}
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />

      {/* AI Sparkle elements at the tip/ink */}
      <path d="M9 19c-1 1-2 2-2 3" className="opacity-50" />
      <path d="M12 22c1-1 3-3 3-3" className="opacity-50" />

      {/* Central Spark */}
      <circle
        cx="11"
        cy="11"
        r="2"
        className="text-blue-400"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export default Logo;
