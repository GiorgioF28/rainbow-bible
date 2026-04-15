import React from 'react';
import { Path } from 'react-native-svg';
import { Book, Connection, FilterType } from '../data/types';
import { calculateArcPath, DEFAULT_BASELINE } from '../utils/arcGeometry';
import { getArcOpacity, getArcStrokeWidth } from '../utils/filters';

interface ArcPathProps {
  connection: Connection;
  fromBook: Book;
  toBook: Book;
  activeFilter: FilterType;
  selectedId: number | null;
  scrubbingId?: number | null;
  baseline?: number;
}

const ArcPath: React.FC<ArcPathProps> = ({
  connection,
  fromBook,
  toBook,
  activeFilter,
  selectedId,
  scrubbingId = null,
  baseline = DEFAULT_BASELINE,
}) => {
  const d           = calculateArcPath(fromBook, toBook, baseline);
  const baseOpacity = getArcOpacity(connection, activeFilter, selectedId, scrubbingId);
  const strokeWidth = getArcStrokeWidth(connection, selectedId, scrubbingId);

  // Archi senza spiegazione: tratteggiati e leggermente più sottili/trasparenti
  const hasExplanation = connection.hasExplanation !== false && connection.explanation?.trim().length > 0;
  const isSelected     = connection.id === selectedId || connection.id === scrubbingId;

  const strokeDasharray = (!hasExplanation && !isSelected) ? '6 5' : undefined;
  // Riduce ulteriormente l'opacità base per archi senza spiegazione (non quando selezionato)
  const opacity = (!hasExplanation && !isSelected)
    ? baseOpacity * 0.65
    : baseOpacity;

  return (
    <Path
      d={d}
      stroke={connection.color}
      strokeWidth={strokeWidth}
      fill="none"
      opacity={opacity}
      strokeDasharray={strokeDasharray}
    />
  );
};

export default React.memo(ArcPath);
