import { FC, useMemo } from "react";

interface VkMusicIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * VK Music Icon:
 * Dual-tone squircle (top #0073f7 blue, bottom #ec5cf7 pink with wave separation)
 * with transparent cutout holes for the sound wave bars.
 */
export const VkMusicIcon: FC<VkMusicIconProps> = ({ size = 16, className, style }) => {
  const maskId = useMemo(() => `vk-mask-${Math.random().toString(36).substring(2, 9)}`, []);
  const clipId = useMemo(() => `vk-clip-${Math.random().toString(36).substring(2, 9)}`, []);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        ...style,
      }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width="100" height="100" rx="22" ry="22" />
        </clipPath>
        <mask id={maskId}>
          {/* White base makes everything visible */}
          <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
          {/* Black pills create transparent cutout holes */}
          <rect x="11.8" y="53.0" width="8.8" height="14.0" rx="4.4" ry="4.4" fill="#000000" />
          <rect x="28.2" y="53.0" width="8.8" height="14.0" rx="4.4" ry="4.4" fill="#000000" />
          <rect x="44.8" y="46.8" width="8.8" height="26.4" rx="4.4" ry="4.4" fill="#000000" />
          <rect x="61.2" y="35.3" width="8.8" height="49.4" rx="4.4" ry="4.4" fill="#000000" />
          <rect x="77.6" y="46.8" width="8.8" height="26.4" rx="4.4" ry="4.4" fill="#000000" />
        </mask>
      </defs>

      <g clipPath={`url(#${clipId})`} mask={`url(#${maskId})`}>
        {/* Top VK Blue background */}
        <rect x="0" y="0" width="100" height="100" fill="#0073f7" />
        {/* Bottom Pink Wave */}
        <path
          fill="#ec5cf7"
          d="M 0,46.5 C 32,46.5 46,20 66,20 C 81,20 92,29 100,35.5 L 100,100 L 0,100 Z"
        />
      </g>
    </svg>
  );
};
