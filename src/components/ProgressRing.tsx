import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { AppPalette } from '../theme/palettes';

type Props = {
  /** 0–1 completion amount for the ring stroke. */
  progress: number;
  label: string;
  caption: string;
  colors: AppPalette;
  size?: number;
  strokeWidth?: number;
  accentColor: string;
};

/**
 * Simple SVG ring used on Insights to visualise ratios without a charting library.
 */
export function ProgressRing({
  progress,
  label,
  caption,
  colors,
  size = 112,
  strokeWidth = 10,
  accentColor,
}: Props) {
  const p = Math.max(0, Math.min(1, progress));
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = useMemo(() => 2 * Math.PI * r, [r]);
  const offset = circumference * (1 - p);

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={colors.chartTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={accentColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={[styles.label, { color: colors.onSurface }]}>{label}</Text>
        <Text style={[styles.cap, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
          {caption}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 20,
    fontWeight: '900',
  },
  cap: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
});
