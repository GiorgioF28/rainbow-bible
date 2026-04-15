/**
 * ArcVisualization — pure render component, NO internal ScrollView.
 * Wrap this in a horizontal ScrollView at the call site so that
 * ArcTouchLayer can be placed as an absoluteFill sibling inside the
 * same ScrollView content View, letting the ScrollView steal touches
 * naturally on horizontal swipe.
 *
 * Props:
 *  - connections: optional override list (if omitted, uses CONNECTIONS)
 *  - activeFilter: further filters by type (ignored when connections provided externally)
 *  - focusBookId: dims non-connected books/arcs + highlights the focus book
 *  - displayHeight: total pixel height for the SVG+labels area
 */
import React from 'react';
import { View } from 'react-native';
import Svg, {
  Defs, RadialGradient, Stop, Filter,
  FeGaussianBlur, FeMerge, FeMergeNode,
  Rect, Line, G, Text as SvgText,
} from 'react-native-svg';
import { BOOKS } from '../data/books';
import { CONNECTIONS } from '../data/connections';
import { Connection, FilterType } from '../data/types';
import { bookX, MARGIN_L } from '../utils/arcGeometry';
import { getArcOpacity, getArcStrokeWidth } from '../utils/filters';
import { COLORS } from '../theme/colors';
import ArcPath from './ArcPath';

// ── Constants ──────────────────────────────────────────────────────────────
export const ARC_VIZ_W = 1800;
const LABEL_AREA = 70;
const MIN_VIZ_H = 220;

export { LABEL_AREA };

interface ArcVisualizationProps {
  activeFilter: FilterType;
  selectedId: number | null;
  scrubbingId?: number | null;
  /** When set: only arcs involving this book are shown at full opacity */
  focusBookId?: string | null;
  /** Total pixel height for the visualization */
  displayHeight: number;
  /**
   * Override the connection list to render.
   * If omitted, uses CONNECTIONS (further filtered by activeFilter and focusBookId).
   */
  connections?: Connection[];
}

const ArcVisualization: React.FC<ArcVisualizationProps> = ({
  activeFilter,
  selectedId,
  scrubbingId = null,
  focusBookId = null,
  displayHeight,
  connections: connectionsProp,
}) => {
  const vizH = Math.max(displayHeight, MIN_VIZ_H);
  const baseline = vizH - LABEL_AREA - 4;

  // Resolve which connections to render
  let connections: Connection[];
  if (connectionsProp !== undefined) {
    // Externally supplied — still apply activeFilter on top
    connections = activeFilter === 'all'
      ? connectionsProp
      : connectionsProp.filter(c => c.type === activeFilter);
  } else {
    const base = focusBookId
      ? CONNECTIONS.filter(c => c.from === focusBookId || c.to === focusBookId)
      : CONNECTIONS;
    connections = activeFilter === 'all' ? base : base.filter(c => c.type === activeFilter);
  }

  return (
    <View style={{ width: ARC_VIZ_W, height: vizH }}>
      <Svg
        width={ARC_VIZ_W}
        height={vizH}
        viewBox={`0 0 ${ARC_VIZ_W} ${vizH}`}
      >
        <Defs>
          <RadialGradient id="bgGlow" cx="50%" cy="100%" r="60%">
            <Stop offset="0%" stopColor="#2a1a05" stopOpacity={1} />
            <Stop offset="100%" stopColor="#1a1208" stopOpacity={1} />
          </RadialGradient>
          <Filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <FeGaussianBlur stdDeviation={2.5} result="blur" />
            <FeMerge>
              <FeMergeNode in="blur" />
              <FeMergeNode in="SourceGraphic" />
            </FeMerge>
          </Filter>
        </Defs>

        {/* Background */}
        <Rect width={ARC_VIZ_W} height={vizH} fill="url(#bgGlow)" />

        {/* Spine */}
        <Line
          x1={MARGIN_L} y1={baseline}
          x2={ARC_VIZ_W - MARGIN_L} y2={baseline}
          stroke="rgba(201,168,76,0.4)" strokeWidth={1.5}
        />

        {/* Arcs */}
        <G filter="url(#glow)">
          {connections.map(conn => {
            const fromBook = BOOKS.find(b => b.id === conn.from);
            const toBook   = BOOKS.find(b => b.id === conn.to);
            if (!fromBook || !toBook) return null;
            return (
              <ArcPath
                key={conn.id}
                connection={conn}
                fromBook={fromBook}
                toBook={toBook}
                activeFilter={activeFilter}
                selectedId={selectedId}
                scrubbingId={scrubbingId}
                baseline={baseline}
              />
            );
          })}
        </G>

        {/* Book ticks and rotated labels */}
        <G>
          {BOOKS.map(book => {
            const x = bookX(book);
            const isFocused = book.id === focusBookId;
            const isConnected = focusBookId
              ? connections.some(c => c.from === book.id || c.to === book.id)
              : false;

            let labelColor: string;
            if (isFocused) labelColor = COLORS.gold;
            else if (focusBookId && !isConnected) labelColor = 'rgba(168,144,96,0.2)';
            else labelColor = book.testament === 'NT' ? '#c49de0' : COLORS.inkDim;

            const tickH = isFocused ? 10 : 6;
            const tickW = isFocused ? 2 : 0.8;

            return (
              <G key={book.id}>
                <Line
                  x1={x} y1={baseline}
                  x2={x} y2={baseline + tickH}
                  stroke={isFocused ? COLORS.gold : COLORS.inkDim}
                  strokeWidth={tickW}
                  opacity={focusBookId && !isConnected && !isFocused ? 0.15 : 0.7}
                />
                <SvgText
                  x={x}
                  y={baseline + 8}
                  fill={labelColor}
                  fontSize={isFocused ? 14 : 11}
                  fontFamily="Cinzel_400Regular"
                  textAnchor="end"
                  transform={`rotate(-65, ${x}, ${baseline + 8})`}
                  opacity={focusBookId && !isConnected && !isFocused ? 0.2 : 1}
                >
                  {book.name}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

export default ArcVisualization;
