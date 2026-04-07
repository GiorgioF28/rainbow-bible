export interface Book {
  id: string;
  name: string;
  position: number;
  testament: 'OT' | 'NT';
  genre: 'law' | 'history' | 'wisdom' | 'prophecy' | 'gospel' | 'epistle';
}

export interface Connection {
  id: number;
  from: string;
  to: string;
  type: 'prophecy' | 'wisdom' | 'gospel' | 'epistle';
  color: string;
  refA: string;
  refB: string;
  textA: string;
  textB: string;
  explanation: string;
  author_a: string;
  author_b: string;
  period: string;
  link_type: string;
}

export type FilterType = 'all' | 'prophecy' | 'wisdom' | 'gospel' | 'epistle';
