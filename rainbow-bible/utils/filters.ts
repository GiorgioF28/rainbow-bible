import { Connection, FilterType } from '../data/types';

export function getArcOpacity(
  connection: Connection,
  activeFilter: FilterType,
  selectedId: number | null
): number {
  if (selectedId !== null) {
    return connection.id === selectedId ? 1 : 0.08;
  }
  if (activeFilter === 'all') return 0.45;
  return connection.type === activeFilter ? 0.45 : 0.08;
}

export function getArcStrokeWidth(
  connection: Connection,
  selectedId: number | null
): number {
  return connection.id === selectedId ? 2.5 : 0.8;
}
