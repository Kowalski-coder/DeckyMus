import { FC } from "react";

interface YandexMusicIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Yandex Music Icon: yellow squircle with transparent starburst cutout
 * (designed to match the styling of the YouTube Music red squircle/play icon).
 */
export const YandexMusicIcon: FC<YandexMusicIconProps> = ({ size = 16, className, style }) => {
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
      <path
        fill="#facc15"
        fillRule="evenodd"
        d="M 22,0 H 78 A 22,22 0 0 1 100,22 V 78 A 22,22 0 0 1 78,100 H 22 A 22,22 0 0 1 0,78 V 22 A 22,22 0 0 1 22,0 Z M 56.2,8.4 L 57.2,8.4 L 65.2,26.4 L 72.6,14.4 L 73.6,15.1 L 72.2,30.1 L 83.6,24.4 L 84.6,25.1 L 76.9,36.1 L 90.3,38.5 L 90.6,39.8 L 77.9,43.1 L 90.6,52.5 L 91.6,54.5 L 76.3,49.5 L 87.0,68.9 L 86.3,70.6 L 71.9,54.8 L 75.6,81.3 L 74.6,83.6 L 64.9,56.5 L 51.2,89.0 L 49.8,91.6 L 47.8,91.6 L 55.5,54.5 L 16.1,75.3 L 15.4,73.2 L 47.8,46.5 L 8.4,41.5 L 9.0,39.8 L 46.2,36.8 L 19.4,20.7 L 22.7,20.1 L 50.8,29.4 L 36.1,10.0 L 38.1,10.0 L 57.5,25.8 L 56.2,8.4 Z"
      />
    </svg>
  );
};
