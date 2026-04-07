/**
 * ZoomableView — pinch to zoom + 1-finger pan + double-tap reset
 *
 * Uses only React Native Animated + RNGH v1 gesture handlers.
 * No react-native-reanimated import → no worklets runtime conflict with Expo Go.
 */
import React, { useRef, useState, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import {
  PinchGestureHandler,
  PanGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler';

interface ZoomableViewProps {
  children: React.ReactNode;
  style?: object;
  onZoomChange?: (isZoomed: boolean) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;

const ZoomableView: React.FC<ZoomableViewProps> = ({ children, style, onZoomChange }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  // All Animated values created once via lazy useState
  const [anim] = useState(() => {
    const baseScale = new Animated.Value(1);  // committed scale after each pinch
    const pinchScale = new Animated.Value(1); // live delta within current pinch
    const baseTx = new Animated.Value(0);     // committed x after each pan
    const baseTy = new Animated.Value(0);
    const panTx = new Animated.Value(0);      // live delta within current pan
    const panTy = new Animated.Value(0);
    return {
      baseScale, pinchScale,
      baseTx, baseTy, panTx, panTy,
      scale: Animated.multiply(baseScale, pinchScale),
      tx: Animated.add(baseTx, panTx),
      ty: Animated.add(baseTy, panTy),
    };
  });

  // JS refs track the committed numeric values so we can clamp and accumulate
  const lastScale = useRef(1);
  const lastTx = useRef(0);
  const lastTy = useRef(0);

  const pinchRef = useRef<PinchGestureHandler>(null);
  const panRef = useRef<PanGestureHandler>(null);
  const doubleTapRef = useRef<TapGestureHandler>(null);

  const notify = (v: boolean) => {
    setIsZoomed(v);
    onZoomChange?.(v);
  };

  const resetAll = () => {
    Animated.parallel([
      Animated.spring(anim.baseScale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(anim.baseTx,    { toValue: 0, useNativeDriver: true }),
      Animated.spring(anim.baseTy,    { toValue: 0, useNativeDriver: true }),
    ]).start();
    anim.pinchScale.setValue(1);
    anim.panTx.setValue(0);
    anim.panTy.setValue(0);
    lastScale.current = 1;
    lastTx.current = 0;
    lastTy.current = 0;
    notify(false);
  };

  // Animated.event handlers created once (stable deps)
  const onPinchEvent = useMemo(
    () => Animated.event(
      [{ nativeEvent: { scale: anim.pinchScale } }],
      { useNativeDriver: true }
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onPanEvent = useMemo(
    () => Animated.event(
      [{ nativeEvent: { translationX: anim.panTx, translationY: anim.panTy } }],
      { useNativeDriver: true }
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Pinch state ────────────────────────────────────────────────────────────
  const onPinchStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      const next = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, lastScale.current * nativeEvent.scale)
      );
      lastScale.current = next;
      anim.baseScale.setValue(next);
      anim.pinchScale.setValue(1);
      next <= 1.05 ? resetAll() : notify(true);
    }
    // cancelled / failed mid-gesture
    if (nativeEvent.state === State.CANCELLED || nativeEvent.state === State.FAILED) {
      anim.pinchScale.setValue(1);
    }
  };

  // ── Pan state ──────────────────────────────────────────────────────────────
  const onPanStateChange = ({ nativeEvent }: any) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      lastTx.current += nativeEvent.translationX;
      lastTy.current += nativeEvent.translationY;
      anim.baseTx.setValue(lastTx.current);
      anim.baseTy.setValue(lastTy.current);
      anim.panTx.setValue(0);
      anim.panTy.setValue(0);
    }
    if (nativeEvent.state === State.CANCELLED || nativeEvent.state === State.FAILED) {
      anim.panTx.setValue(0);
      anim.panTy.setValue(0);
    }
  };

  // ── Double-tap reset ───────────────────────────────────────────────────────
  const onDoubleTap = ({ nativeEvent }: any) => {
    if (nativeEvent.oldState === State.ACTIVE) resetAll();
  };

  return (
    <View style={[styles.container, style]}>
      <TapGestureHandler
        ref={doubleTapRef}
        numberOfTaps={2}
        enabled={isZoomed}
        onHandlerStateChange={onDoubleTap}
        waitFor={[panRef, pinchRef]}
      >
        <Animated.View style={styles.fill}>
          <PanGestureHandler
            ref={panRef}
            enabled={isZoomed}
            minPointers={1}
            maxPointers={1}
            onGestureEvent={onPanEvent}
            onHandlerStateChange={onPanStateChange}
            simultaneousHandlers={[pinchRef]}
          >
            <Animated.View style={styles.fill}>
              <PinchGestureHandler
                ref={pinchRef}
                onGestureEvent={onPinchEvent}
                onHandlerStateChange={onPinchStateChange}
                simultaneousHandlers={[panRef]}
              >
                <Animated.View
                  style={[
                    styles.fill,
                    {
                      transform: [
                        { translateX: anim.tx },
                        { translateY: anim.ty },
                        { scale: anim.scale },
                      ],
                    },
                  ]}
                >
                  {children}
                </Animated.View>
              </PinchGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </TapGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  fill: { flex: 1 },
});

export default ZoomableView;
