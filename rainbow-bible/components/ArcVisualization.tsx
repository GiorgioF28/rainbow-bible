import React, { useCallback } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
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
import { bookX, DEFAULT_BASELINE, MARGIN_L } from '../utils/arcGeometry';
import { COLORS } from '../theme/colors';
import ArcPath from './ArcPath';

interface ArcVisualizationProps {
  activeFilter: FilterType;
  selectedId: number | null;
  onArcPress: (id: number) => void;
  /**
   * When provided (landscape mode), the SVG fills this exact pixel height.
   * The viewBox height and baseline are computed proportionally.
   */
  svgDisplayHeight?: number;
}

const VIEW_W = 900;
const DEFAULT_VIEW_H = 340;

const ArcVisualization: React.FC<ArcVisualizationProps> = ({
  activeFilter,
  selectedId,
  onArcPress,
  svgDisplayHeight,
}) => {
  const { width: screenWidth } = useWindowDimensions();

  const handleArcPress = useCallback(
    (id: number) => {
      onArcPress(id);
    },
    [onArcPress]
  );

  // In landscape we use full screen width; in portrait we leave 16px padding
  const svgDisplayWidth = svgDisplayHeight
    ? screenWidth
    : screenWidth - 16;

  const svgDisplayH = svgDisplayHeight
    ? svgDisplayHeight
    : (svgDisplayWidth * DEFAULT_VIEW_H) / VIEW_W;

  // viewBox height scales proportionally with the display dimensions
  const viewBoxH = svgDisplayHeight
    ? Math.round(VIEW_W * svgDisplayHeight / svgDisplayWidth)
    : DEFAULT_VIEW_H;

  // Baseline: leave 50 viewBox units at bottom for ticks + labels
  const baseline = svgDisplayHeight
    ? viewBoxH - 50
    : DEFAULT_BASELINE;

  return (
    <Svg
      width={svgDisplayWidth}
      height={svgDisplayH}
      viewBox={`0 0 ${VIEW_W} ${viewBoxH}`}
      style={styles.svg}
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

      {/* Background */}
      <Rect width={VIEW_W} height={viewBoxH} fill="url(#bgGlow)" />

      {/* Spine line */}
      <Line
        x1={MARGIN_L}
        y1={baseline}
        x2={880}
        y2={baseline}
        stroke="rgba(201,168,76,0.4)"
        strokeWidth={1}
      />

      {/* Arcs */}
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
              onPress={handleArcPress}
              baseline={baseline}
            />
          );
        })}
      </G>

      {/* Book ticks and labels */}
      <G>
        {BOOKS.map((book) => {
          const x = bookX(book);
          const labelColor = book.testament === 'NT' ? '#c49de0' : COLORS.inkDim;
          return (
            <G key={book.id}>
              <Line
                x1={x}
                y1={baseline}
                x2={x}
                y2={baseline + 6}
                stroke={COLORS.inkDim}
                strokeWidth={0.5}
                opacity={0.5}
              />
              <SvgText
                x={x}
                y={baseline + 16}
                fill={labelColor}
                fontSize={5}
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

const styles = StyleSheet.create({
  svg: {
    alignSelf: 'center',
  },
});

export default ArcVisualization;
