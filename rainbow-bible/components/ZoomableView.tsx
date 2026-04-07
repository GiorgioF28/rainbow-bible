import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface ZoomableViewProps {
  children: React.ReactNode;
  style?: object;
  /** Called when zoom state changes so the parent can disable/enable ScrollView */
  onZoomChange?: (isZoomed: boolean) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;

function clamp(val: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(val, min), max);
}

const ZoomableView: React.FC<ZoomableViewProps> = ({
  children,
  style,
  onZoomChange,
}) => {
  // Current transform state
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  // State saved at gesture start
  const startScale = useSharedValue(1);
  const startTx = useSharedValue(0);
  const startTy = useSharedValue(0);
  const startFocalX = useSharedValue(0);
  const startFocalY = useSharedValue(0);

  // Whether we are currently zoomed in — React state drives .enabled() on the pan gesture
  const [isZoomed, setIsZoomed] = useState(false);
  // Shared-value mirror so worklets can read without crossing the JS bridge
  const isZoomedSV = useSharedValue(false);

  const notifyZoomChange = useCallback(
    (zoomed: boolean) => {
      setIsZoomed(zoomed);
      onZoomChange?.(zoomed);
    },
    [onZoomChange]
  );

  // ── Pinch gesture ───────────────────────────────────────────────────────────
  const pinchGesture = Gesture.Pinch()
    .onBegin((e) => {
      startScale.value = scale.value;
      startTx.value = tx.value;
      startTy.value = ty.value;
      startFocalX.value = e.focalX;
      startFocalY.value = e.focalY;
    })
    .onUpdate((e) => {
      const newScale = clamp(startScale.value * e.scale, MIN_SCALE, MAX_SCALE);
      const ratio = newScale / startScale.value;

      scale.value = newScale;
      // Keep the focal point stationary while scaling
      tx.value = startFocalX.value * (1 - ratio) + startTx.value * ratio;
      ty.value = startFocalY.value * (1 - ratio) + startTy.value * ratio;

      const zoomed = newScale > 1.05;
      if (isZoomedSV.value !== zoomed) {
        isZoomedSV.value = zoomed;
        runOnJS(notifyZoomChange)(zoomed);
      }
    })
    .onEnd(() => {
      if (scale.value <= 1.05) {
        scale.value = withSpring(1, { damping: 20 });
        tx.value = withSpring(0, { damping: 20 });
        ty.value = withSpring(0, { damping: 20 });
        if (isZoomedSV.value) {
          isZoomedSV.value = false;
          runOnJS(notifyZoomChange)(false);
        }
      }
    });

  // ── Pan gesture (1-finger, only when zoomed) ────────────────────────────────
  const panGesture = Gesture.Pan()
    .maxPointers(1)
    .enabled(isZoomed)
    .onBegin(() => {
      startTx.value = tx.value;
      startTy.value = ty.value;
    })
    .onUpdate((e) => {
      tx.value = startTx.value + e.translationX;
      ty.value = startTy.value + e.translationY;
    });

  // ── Double-tap to toggle zoom ───────────────────────────────────────────────
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(400)
    .onEnd((e) => {
      if (scale.value > 1.05) {
        // Reset to 1×
        scale.value = withSpring(1, { damping: 20 });
        tx.value = withSpring(0, { damping: 20 });
        ty.value = withSpring(0, { damping: 20 });
        if (isZoomedSV.value) {
          isZoomedSV.value = false;
          runOnJS(notifyZoomChange)(false);
        }
      } else {
        // Zoom in 2.5× centred on tap point
        const newScale = 2.5;
        scale.value = withSpring(newScale, { damping: 20 });
        tx.value = withSpring(e.x * (1 - newScale), { damping: 20 });
        ty.value = withSpring(e.y * (1 - newScale), { damping: 20 });
        if (!isZoomedSV.value) {
          isZoomedSV.value = true;
          runOnJS(notifyZoomChange)(true);
        }
      }
    });

  const composed = Gesture.Race(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture)
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <View style={[styles.container, style]}>
        <Animated.View style={animStyle}>{children}</Animated.View>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default ZoomableView;
