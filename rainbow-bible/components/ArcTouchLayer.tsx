/**
 * ArcTouchLayer — transparent View that sits on top of the SVG and handles:
 *   - Tap: find nearest arc, call onSelect(id)
 *   - Long-press + drag: highlight nearest arc while finger moves, call onSelect on release
 *
 * Using React Native's Responder system (no RNGH/Reanimated dependency).
 * Coordinates from the View responder are in display-pixel space; we convert
 * to SVG space via the explicit scale factors passed as props.
 */
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { findNearestArc } from '../utils/arcGeometry';
import { BOOKS } from '../data/books';
import { Connection } from '../data/types';

interface ArcTouchLayerProps {
  /** Display-pixel dimensions of the rendered SVG */
  svgDisplayWidth: number;
  svgDisplayHeight: number;
  /** SVG viewBox dimensions */
  viewBoxW: number;
  viewBoxH: number;
  baseline: number;
  /** Connections to search through (pre-filtered by active filter) */
  visibleConnections: Connection[];
  /**
   * Horizontal scroll offset of the containing ScrollView (display px).
   * Needed to convert screen-relative touch X into the scrollable SVG's X.
   */
  scrollOffsetX?: number;
  /** Called on tap or long-press release with the nearest arc id (or null) */
  onSelect: (id: number | null) => void;
  /** Called during long-press drag with the currently nearest arc id (or null) */
  onScrub: (id: number | null) => void;
}

const LONG_PRESS_MS = 380;
const MOVE_SLOP = 8; // display px; if moved more than this before LP fires, treat as scroll

const ArcTouchLayer: React.FC<ArcTouchLayerProps> = ({
  svgDisplayWidth,
  svgDisplayHeight,
  viewBoxW,
  viewBoxH,
  baseline,
  visibleConnections,
  scrollOffsetX = 0,
  onSelect,
  onScrub,
}) => {
  const pressTime = useRef(0);
  const pressX = useRef(0);
  const pressY = useRef(0);
  const isScrubbing = useRef(false);
  const lpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Convert touch position → SVG coordinate space.
   * locationX from the RN Responder is relative to the ArcTouchLayer View,
   * which fills the full 1800px scroll-content view — already in SVG coords.
   * Do NOT add scrollOffsetX (that would double-count the scroll offset).
   */
  const toSvg = (px: number, py: number) => ({
    x: px * (viewBoxW / svgDisplayWidth),
    y: py * (viewBoxH / svgDisplayHeight),
  });

  const nearest = (px: number, py: number): number | null => {
    const { x, y } = toSvg(px, py);
    return findNearestArc(x, y, visibleConnections, BOOKS, baseline);
  };

  const clearLPTimer = () => {
    if (lpTimer.current) {
      clearTimeout(lpTimer.current);
      lpTimer.current = null;
    }
  };

  return (
    <View
      style={StyleSheet.absoluteFill}
      // Always claim touch start so we can decide later
      onStartShouldSetResponder={() => true}
      // Claim move only once scrubbing has started (otherwise ScrollView scrolls)
      onMoveShouldSetResponder={() => isScrubbing.current}
      onResponderGrant={(e) => {
        const { locationX, locationY } = e.nativeEvent;
        pressTime.current = Date.now();
        pressX.current = locationX;
        pressY.current = locationY;
        isScrubbing.current = false;

        // Start long-press timer
        lpTimer.current = setTimeout(() => {
          isScrubbing.current = true;
          const id = nearest(locationX, locationY);
          onScrub(id);
        }, LONG_PRESS_MS);
      }}
      onResponderMove={(e) => {
        const { locationX, locationY } = e.nativeEvent;

        // If finger moved too much before LP fired, cancel LP and let ScrollView take over
        if (!isScrubbing.current) {
          const dx = Math.abs(locationX - pressX.current);
          const dy = Math.abs(locationY - pressY.current);
          if (dx > MOVE_SLOP || dy > MOVE_SLOP) {
            clearLPTimer();
          }
          return;
        }

        // Scrubbing: update highlighted arc in real-time
        const id = nearest(locationX, locationY);
        onScrub(id);
      }}
      onResponderRelease={(e) => {
        const { locationX, locationY } = e.nativeEvent;
        const wasScrubbing = isScrubbing.current;
        clearLPTimer();
        isScrubbing.current = false;
        onScrub(null); // clear scrubbing highlight

        if (wasScrubbing) {
          // Confirm the last scrubbed arc
          const id = nearest(locationX, locationY);
          onSelect(id);
        } else {
          // Regular tap
          const id = nearest(locationX, locationY);
          onSelect(id);
        }
      }}
      onResponderTerminate={() => {
        clearLPTimer();
        isScrubbing.current = false;
        onScrub(null);
      }}
    />
  );
};

export default ArcTouchLayer;
