import { Book, Connection } from '../data/types';

export const W = 900;
export const DEFAULT_BASELINE = 290;
export const MARGIN_L = 20;
export const USABLE = 860;

export function bookX(book: Book): number {
  return MARGIN_L + book.position * USABLE;
}

export function calculateArcPath(
  fromBook: Book,
  toBook: Book,
  baseline: number = DEFAULT_BASELINE
): string {
  const x1 = bookX(fromBook);
  const x2 = bookX(toBook);
  const midX = (x1 + x2) / 2;
  const span = Math.abs(x2 - x1);
  const maxHeight = Math.max(baseline - 20, 10);
  const height = Math.min(span * 0.55, 250, maxHeight);
  const controlY = baseline - height;
  return `M${x1},${baseline} Q${midX},${controlY} ${x2},${baseline}`;
}

/** Minimum distance from (tapX, tapY) to the arc Bézier curve. */
function distanceToArc(
  tapX: number,
  tapY: number,
  fromBook: Book,
  toBook: Book,
  baseline: number
): number {
  const x1 = bookX(fromBook);
  const x2 = bookX(toBook);
  const midX = (x1 + x2) / 2;
  const span = Math.abs(x2 - x1);
  const maxHeight = Math.max(baseline - 20, 10);
  const height = Math.min(span * 0.55, 250, maxHeight);
  const controlY = baseline - height;

  let minDist = Infinity;
  // Sample 40 points for good precision
  for (let t = 0; t <= 1; t += 0.025) {
    const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
    const by = (1 - t) * (1 - t) * baseline + 2 * (1 - t) * t * controlY + t * t * baseline;
    const d = Math.sqrt((tapX - bx) ** 2 + (tapY - by) ** 2);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

/**
 * Find the connection whose arc is closest to the tap point (SVG coordinates).
 * Only considers connections visible under the active filter.
 * Returns the connection id, or null if nothing is within maxDistance.
 */
export function findNearestArc(
  tapX: number,
  tapY: number,
  connections: Connection[],
  books: Book[],
  baseline: number = DEFAULT_BASELINE,
  maxDistance = 25
): number | null {
  let nearestId: number | null = null;
  let nearestDist = maxDistance;

  for (const conn of connections) {
    const fromBook = books.find((b) => b.id === conn.from);
    const toBook = books.find((b) => b.id === conn.to);
    if (!fromBook || !toBook) continue;

    const d = distanceToArc(tapX, tapY, fromBook, toBook, baseline);
    if (d < nearestDist) {
      nearestDist = d;
      nearestId = conn.id;
    }
  }

  return nearestId;
}

export function isPointNearArc(
  tapX: number,
  tapY: number,
  fromBook: Book,
  toBook: Book,
  baseline: number = DEFAULT_BASELINE,
  threshold = 12
): boolean {
  return distanceToArc(tapX, tapY, fromBook, toBook, baseline) < threshold;
}

// Legacy export
export { DEFAULT_BASELINE as BASELINE };
