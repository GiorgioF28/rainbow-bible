import { Book } from '../data/types';

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
  // Cap arc height so it never exceeds baseline - 20 (leaves 20 units clearance at top)
  const maxHeight = Math.max(baseline - 20, 10);
  const height = Math.min(span * 0.55, 250, maxHeight);
  const controlY = baseline - height;
  return `M${x1},${baseline} Q${midX},${controlY} ${x2},${baseline}`;
}

export function isPointNearArc(
  tapX: number,
  tapY: number,
  fromBook: Book,
  toBook: Book,
  baseline: number = DEFAULT_BASELINE,
  threshold = 12
): boolean {
  const x1 = bookX(fromBook);
  const x2 = bookX(toBook);
  const midX = (x1 + x2) / 2;
  const span = Math.abs(x2 - x1);
  const maxHeight = Math.max(baseline - 20, 10);
  const height = Math.min(span * 0.55, 250, maxHeight);
  const controlY = baseline - height;

  for (let t = 0; t <= 1; t += 0.05) {
    const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
    const by =
      (1 - t) * (1 - t) * baseline +
      2 * (1 - t) * t * controlY +
      t * t * baseline;
    const dist = Math.sqrt((tapX - bx) ** 2 + (tapY - by) ** 2);
    if (dist < threshold) return true;
  }
  return false;
}

// Legacy export for backwards compatibility
export { DEFAULT_BASELINE as BASELINE };
