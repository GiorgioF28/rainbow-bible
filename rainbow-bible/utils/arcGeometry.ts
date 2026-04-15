import { Book, Connection } from '../data/types';

// SVG canvas is 1 800 px wide, displayed at 1 800 display-px (1 : 1).
export const W = 1800;
export const MARGIN_L = 30;
export const USABLE = 1740; // W - 2 * MARGIN_L
export const DEFAULT_BASELINE = 370; // used only as fallback; normally computed from displayHeight

export function bookX(book: Book): number {
  return MARGIN_L + book.position * USABLE;
}

/**
 * Cubic Bézier arc.
 * Control points are inset 15% of span from each endpoint, both at peak height.
 * This makes the arc rise steeply on BOTH sides so it's clearly visible even
 * when only the left or right portion of the canvas is on screen.
 */
export function calculateArcPath(
  fromBook: Book,
  toBook: Book,
  baseline: number = DEFAULT_BASELINE
): string {
  const x1 = bookX(fromBook);
  const x2 = bookX(toBook);
  const span = Math.abs(x2 - x1);
  const maxHeight = Math.max(baseline - 20, 10);
  const height = Math.min(span * 0.65, maxHeight);
  const controlY = baseline - height;
  const inset = span * 0.15;
  const cp1x = x1 + inset;
  const cp2x = x2 - inset;
  return `M${x1},${baseline} C${cp1x},${controlY} ${cp2x},${controlY} ${x2},${baseline}`;
}

/**
 * Minimum distance from (tapX, tapY) to the cubic Bézier arc.
 * Samples 60 points along t∈[0,1].
 */
function distanceToArc(
  tapX: number,
  tapY: number,
  fromBook: Book,
  toBook: Book,
  baseline: number
): number {
  const x1 = bookX(fromBook);
  const x2 = bookX(toBook);
  const span = Math.abs(x2 - x1);
  const maxHeight = Math.max(baseline - 20, 10);
  const height = Math.min(span * 0.65, maxHeight);
  const controlY = baseline - height;
  const inset = span * 0.15;
  const cp1x = x1 + inset;
  const cp2x = x2 - inset;

  let minDist = Infinity;
  // Cubic bezier: P(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
  for (let t = 0; t <= 1; t += 0.017) { // ~60 samples
    const mt = 1 - t;
    const bx = mt*mt*mt*x1 + 3*mt*mt*t*cp1x + 3*mt*t*t*cp2x + t*t*t*x2;
    const by = mt*mt*mt*baseline + 3*mt*mt*t*controlY + 3*mt*t*t*controlY + t*t*t*baseline;
    const d = Math.sqrt((tapX - bx) ** 2 + (tapY - by) ** 2);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

/**
 * Returns the id of the arc closest to (tapX, tapY) in SVG coordinates,
 * or null if nothing is within maxDistance SVG units.
 */
export function findNearestArc(
  tapX: number,
  tapY: number,
  connections: Connection[],
  books: Book[],
  baseline: number = DEFAULT_BASELINE,
  maxDistance = 130  // generous — ~130 SVG units ≈ 130 display px at 1:1
): number | null {
  let nearestId: number | null = null;
  let nearestDist = maxDistance;

  for (const conn of connections) {
    const fromBook = books.find((b) => b.id === conn.from);
    const toBook   = books.find((b) => b.id === conn.to);
    if (!fromBook || !toBook) continue;
    const d = distanceToArc(tapX, tapY, fromBook, toBook, baseline);
    if (d < nearestDist) {
      nearestDist = d;
      nearestId   = conn.id;
    }
  }
  return nearestId;
}

// Legacy alias
export { DEFAULT_BASELINE as BASELINE };
