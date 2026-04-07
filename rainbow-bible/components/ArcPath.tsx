import React from 'react';
import { Path } from 'react-native-svg';
import { Book, Connection } from '../data/types';
import { calculateArcPath, DEFAULT_BASELINE } from '../utils/arcGeometry';
import { getArcOpacity, getArcStrokeWidth } from '../utils/filters';
import { FilterType } from '../data/types';

interface ArcPathProps {
  connection: Connection;
  fromBook: Book;
  toBook: Book;
  activeFilter: FilterType;
  selectedId: number | null;
  onPress: (id: number) => void;
  baseline?: number;
}

const ArcPath: React.FC<ArcPathProps> = ({
  connection,
  fromBook,
  toBook,
  activeFilter,
  selectedId,
  onPress,
  baseline = DEFAULT_BASELINE,
}) => {
  const d = calculateArcPath(fromBook, toBook, baseline);
  const opacity = getArcOpacity(connection, activeFilter, selectedId);
  const strokeWidth = getArcStrokeWidth(connection, selectedId);

  return (
    <Path
      d={d}
      stroke={connection.color}
      strokeWidth={strokeWidth}
      fill="none"
      opacity={opacity}
      onPress={() => onPress(connection.id)}
    />
  );
};

export default React.memo(ArcPath);
