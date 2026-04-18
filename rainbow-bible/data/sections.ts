export interface BibleSection {
  id: string;
  label: string;
  color: string;
  bookIds: string[];
  /** X position on the macro SVG baseline (0-900 canvas) */
  macroX: number;
}

export const SECTIONS: BibleSection[] = [
  {
    id: 'law', label: 'Legge', color: '#d4a77a', macroX: 60,
    bookIds: ['Gen', 'Exo', 'Lev', 'Num', 'Deu'],
  },
  {
    id: 'history', label: 'Storici', color: '#7ab3d4', macroX: 170,
    bookIds: ['Jos', 'Jdg', 'Rut', '1Sa', '2Sa', '1Ki', '2Ki', '1Ch', '2Ch', 'Ezr', 'Neh', 'Est'],
  },
  {
    id: 'wisdom', label: 'Sapienza', color: '#d4d47a', macroX: 290,
    bookIds: ['Job', 'Psa', 'Pro', 'Ecc', 'Sng'],
  },
  {
    id: 'prophecy', label: 'Profeti', color: '#7ad4a7', macroX: 420,
    bookIds: ['Isa', 'Jer', 'Lam', 'Eze', 'Dan', 'Hos', 'Joe', 'Amo', 'Oba', 'Jon', 'Mic', 'Nah', 'Hab', 'Zep', 'Hag', 'Zec', 'Mal'],
  },
  {
    id: 'gospel', label: 'Vangeli', color: '#d47a7a', macroX: 548,
    bookIds: ['Mat', 'Mar', 'Luk', 'Joh'],
  },
  {
    id: 'acts', label: 'Atti', color: '#7ab3d4', macroX: 622,
    bookIds: ['Act'],
  },
  {
    id: 'epistle', label: 'Lettere', color: '#a77ad4', macroX: 718,
    bookIds: ['Rom', '1Co', '2Co', 'Gal', 'Eph', 'Phi', 'Col', '1Th', '2Th', '1Ti', '2Ti', 'Tit', 'Phm', 'Heb', 'Jas', '1Pe', '2Pe', '1Jn', '2Jn', '3Jn', 'Jud'],
  },
  {
    id: 'apocalypse', label: 'Apoc.', color: '#c87a7a', macroX: 852,
    bookIds: ['Rev'],
  },
];

export function sectionForBook(bookId: string): BibleSection | undefined {
  return SECTIONS.find(s => s.bookIds.includes(bookId));
}
