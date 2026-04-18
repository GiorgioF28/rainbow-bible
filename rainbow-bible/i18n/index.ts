import { LangCode } from './langs';
import ALL_STRINGS, { Strings } from './strings';
import BOOK_NAMES from './bookNames';

// Module-level language state — shared with non-React code (database.ts)
let _lang: LangCode = 'it';

export function setLang(lang: LangCode): void {
  _lang = lang;
}

export function getLang(): LangCode {
  return _lang;
}

/** Translate a UI string key */
export function t(key: keyof Strings): string {
  return ALL_STRINGS[_lang][key] ?? ALL_STRINGS['it'][key];
}

/** Get a book name in the current language */
export function bookName(bookId: string): string {
  return BOOK_NAMES[_lang][bookId] ?? BOOK_NAMES['it'][bookId] ?? bookId;
}

/** Get a section label in the current language */
export function sectionLabel(sectionId: string): string {
  const key = `section_${sectionId}` as keyof Strings;
  return t(key) || sectionId;
}
