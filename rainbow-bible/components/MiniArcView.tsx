/**
 * MiniArcView — compact SVG showing a single arc between two books.
 * Used in the DetailPanel header area to provide spatial context.
 */
import React from 'react';
import { View } from 'react-native';
import Svg, {
  Defs, RadialGradient, Stop,
  Rect, Line, Path, Circle, Text as SvgText,
} from 'react-native-svg';
import { Connection } from '../data/types';
import { BOOKS } from '../data/books';
import { COLORS } from '../theme/colors';

const W = 320;
const H = 90;
const BASELINE = H - 22;
const PAD = 40;
const USABLE = W - PAD * 2;

interface MiniArcViewProps {
  connection: Connection;
}

const MiniArcView: React.FC<MiniArcViewProps> = ({ connection }) => {
  const fromBook = BOOKS.find(b => b.id === connection.from);
  const toBook   = BOOKS.find(b => b.id === connection.to);
  if (!fromBook || !toBook) return null;

  // Map book positions (0..1) into the mini canvas
  const allPositions = [fromBook.position, toBook.position];
  const minP = Math.min(...allPositions);
  const maxP = Math.max(...allPositions);
  const span = maxP - minP || 0.01;

  // Normalize so the two books fill USABLE, with PAD on each side
  const norm = (pos: number) => PAD + ((pos - minP) / span) * USABLE;

  const x1 = norm(fromBook.position);
  const x2 = norm(toBook.position);
  const midX = (x1 + x2) / 2;
  const arcH = Math.min(Math.abs(x2 - x1) * 0.55, BASELINE - 8);
  const controlY = BASELINE - arcH;
  const d = `M${x1},${BASELINE} Q${midX},${controlY} ${x2},${BASELINE}`;

  return (
    <View pointerEvents="none">
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <RadialGradient id="miniBg" cx="50%" cy="100%" r="60%">
            <Stop offset="0%" stopColor="#22160a" stopOpacity={1} />
            <Stop offset="100%" stopColor="#1a1208" stopOpacity={1} />
          </RadialGradient>
        </Defs>

        <Rect width={W} height={H} fill="url(#miniBg)" rx={8} />

        {/* Spine */}
        <Line
          x1={PAD - 10} y1={BASELINE}
          x2={W - PAD + 10} y2={BASELINE}
          stroke="rgba(201,168,76,0.25)" strokeWidth={1}
        />

        {/* Arc */}
        <Path
          d={d}
          stroke={connection.color}
          strokeWidth={2}
          fill="none"
          opacity={0.85}
        />

        {/* Book dots */}
        <Circle cx={x1} cy={BASELINE} r={3} fill={connection.color} opacity={0.9} />
        <Circle cx={x2} cy={BASELINE} r={3} fill={connection.color} opacity={0.9} />

        {/* Book name labels */}
        <SvgText
          x={x1} y={BASELINE + 14}
          fill={COLORS.inkDim}
          fontSize={8}
          fontFamily="Cinzel_400Regular"
          textAnchor="middle"
          opacity={0.9}
        >
          {fromBook.name}
        </SvgText>
        <SvgText
          x={x2} y={BASELINE + 14}
          fill={COLORS.inkDim}
          fontSize={8}
          fontFamily="Cinzel_400Regular"
          textAnchor="middle"
          opacity={0.9}
        >
          {toBook.name}
        </SvgText>
      </Svg>
    </View>
  );
};

export default MiniArcView;
