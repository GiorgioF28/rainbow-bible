import { Connection, FilterType } from '../data/types';

export function getArcOpacity(
  connection: Connection,
  activeFilter: FilterType,
  selectedId: number | null,
  scrubbingId: number | null = null
): number {
  // Scrubbing mode: only the scrubbed arc is visible
  if (scrubbingId !== null) {
    return connection.id === scrubbingId ? 1 : 0.05;
  }
  // A different arc is selected: dim all others
  if (selectedId !== null) {
    return connection.id === selectedId ? 1 : 0.08;
  }
  // Normal filter mode
  if (activeFilter === 'all') return 0.45;
  return connection.type === activeFilter ? 0.45 : 0.08;
}

export function getArcStrokeWidth(
  connection: Connection,
  selectedId: number | null,
  scrubbingId: number | null = null
): number {
  if (connection.id === scrubbingId) return 3;
  if (connection.id === selectedId) return 2.5;
  return 1;
}
