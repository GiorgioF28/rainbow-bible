import React, { useCallback } from 'react';
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Filter,
  FeGaussianBlur,
  FeMerge,
  FeMergeNode,
  Rect,
  Line,
  G,
  Text as SvgText,
} from 'react-native-svg';
import { BOOKS } from '../data/books';
import { CONNECTIONS } from '../data/connections';
import { FilterType } from '../data/types';
import { bookX, DEFAULT_BASELINE, MARGIN_L, findNearestArc } from '../utils/arcGeometry';
import { getArcOpacity } from '../utils/filters';
import { COLORS } from '../theme/colors';
import ArcPath from './ArcPath';
import { useWindowDimensions } from 'react-native';

interface ArcVisualizationProps {
  activeFilter: FilterType;
  selectedId: number | null;
  onArcPress: (id: number) => void;
  svgDisplayHeight?: number;
}

const VIEW_W = 900;
const DEFAULT_VIEW_H = 340;

// NT books start at index 39; stagger in 3 rows so they don't overlap.
// AT books are spread enough for a single row.
function labelRow(bookIndex: number, isNT: boolean): number {
  if (!isNT) return 0; // single row for AT
  return bookIndex % 3;  // 0, 1, 2
}

const ROW_Y_OFFSETS = [12, 22, 32]; // SVG units below baseline per row

const ArcVisualization: React.FC<ArcVisualizationProps> = ({
  activeFilter,
  selectedId,
  onArcPress,
  svgDisplayHeight,
}) => {
  const { width: screenWidth } = useWindowDimensions();

  const svgDisplayWidth = svgDisplayHeight ? screenWidth : screenWidth - 16;
  const svgDisplayH = svgDisplayHeight
    ? svgDisplayHeight
    : (svgDisplayWidth * DEFAULT_VIEW_H) / VIEW_W;

  const viewBoxH = svgDisplayHeight
    ? Math.round(VIEW_W * svgDisplayHeight / svgDisplayWidth)
    : DEFAULT_VIEW_H;

  // Leave 45 SVG units below baseline for staggered labels (3 rows × ~10u + padding)
  const baseline = svgDisplayHeight ? viewBoxH - 45 : DEFAULT_BASELINE;

  // Visible connections under the current filter (for nearest-arc search)
  const visibleConnections = CONNECTIONS.filter((c) =>
    activeFilter === 'all' || c.type === activeFilter
  );

  const handleBgPress = useCallback(
    (event: any) => {
      const x = event.nativeEvent.locationX;
      const y = event.nativeEvent.locationY;
      const nearestId = findNearestArc(x, y, visibleConnections, BOOKS, baseline);
      if (nearestId !== null) {
        onArcPress(nearestId);
      }
    },
    [visibleConnections, baseline, onArcPress]
  );

  let ntBookIndex = 0;

  return (
    <Svg
      width={svgDisplayWidth}
      height={svgDisplayH}
      viewBox={`0 0 ${VIEW_W} ${viewBoxH}`}
    >
      <Defs>
        <RadialGradient id="bgGlow" cx="50%" cy="100%" r="60%">
          <Stop offset="0%" stopColor="#2a1a05" stopOpacity={1} />
          <Stop offset="100%" stopColor="#1a1208" stopOpacity={1} />
        </RadialGradient>
        <Filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <FeGaussianBlur stdDeviation={2} result="blur" />
          <FeMerge>
            <FeMergeNode in="blur" />
            <FeMergeNode in="SourceGraphic" />
          </FeMerge>
        </Filter>
      </Defs>

      {/* Background — captures all taps and routes to nearest arc */}
      <Rect
        width={VIEW_W}
        height={viewBoxH}
        fill="url(#bgGlow)"
        onPress={handleBgPress}
      />

      {/* Spine line */}
      <Line
        x1={MARGIN_L}
        y1={baseline}
        x2={880}
        y2={baseline}
        stroke="rgba(201,168,76,0.4)"
        strokeWidth={1}
      />

      {/* Arcs — onPress removed; all taps handled by background */}
      <G>
        {CONNECTIONS.map((conn) => {
          const fromBook = BOOKS.find((b) => b.id === conn.from);
          const toBook = BOOKS.find((b) => b.id === conn.to);
          if (!fromBook || !toBook) return null;
          return (
            <ArcPath
              key={conn.id}
              connection={conn}
              fromBook={fromBook}
              toBook={toBook}
              activeFilter={activeFilter}
              selectedId={selectedId}
              onPress={onArcPress}
              baseline={baseline}
            />
          );
        })}
      </G>

      {/* Book ticks and staggered labels */}
      <G>
        {BOOKS.map((book, idx) => {
          const x = bookX(book);
          const isNT = book.testament === 'NT';
          const labelColor = isNT ? '#c49de0' : COLORS.inkDim;
          const row = isNT ? labelRow(ntBookIndex++, true) : 0;
          const yOffset = ROW_Y_OFFSETS[row];
          return (
            <G key={book.id}>
              <Line
                x1={x}
                y1={baseline}
                x2={x}
                y2={baseline + 5}
                stroke={COLORS.inkDim}
                strokeWidth={0.5}
                opacity={0.5}
              />
              <SvgText
                x={x}
                y={baseline + yOffset}
                fill={labelColor}
                fontSize={isNT ? 4.5 : 5}
                fontFamily="Cinzel_400Regular"
                textAnchor="middle"
              >
                {book.name}
              </SvgText>
            </G>
          );
        })}
      </G>
    </Svg>
  );
};

export default ArcVisualization;
