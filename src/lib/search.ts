import { Chapter } from '../types';
import { loadAllChapters } from './bookLoader';

export interface SearchMatch {
  index: number;
  length: number;
  text: string;
}

export interface SearchResult {
  segmentId: string;
  chapterId: string;
  chapterTitle: { de: string; es: string };
  segmentIndex: number;
  germanText: string;
  spanishText: string;
  matchedLanguage: 'german' | 'spanish' | 'both';
  matches: {
    german: SearchMatch[];
    spanish: SearchMatch[];
  };
  query: string;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWords?: boolean;
  language?: 'german' | 'spanish' | 'both';
}

/**
 * Escapa caracteres especiales de regex
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Busca texto en todos los capítulos de un libro
 */
export async function searchInBook(
  bookId: string,
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const { caseSensitive = false, language = 'both' } = options;
  
  if (!query.trim()) {
    return [];
  }

  const chapters = await loadAllChapters(bookId);
  const results: SearchResult[] = [];

  const searchRegex = new RegExp(
    escapeRegExp(query.trim()),
    caseSensitive ? 'g' : 'gi'
  );

  for (const chapter of chapters) {
    const chapterResults = searchInChapter(chapter, searchRegex, language, query.trim());
    results.push(...chapterResults);
  }

  return results;
}

/**
 * Busca texto en un capítulo específico
 */
function searchInChapter(
  chapter: Chapter,
  regex: RegExp,
  language: 'german' | 'spanish' | 'both',
  query: string
): SearchResult[] {
  const results: SearchResult[] = [];

  chapter.segments.forEach((segment, index) => {
    const germanText = segment.german.join(' ');
    const spanishText = segment.spanish.join(' ');

    const germanMatches = language !== 'spanish' ? findMatches(germanText, regex) : [];
    const spanishMatches = language !== 'german' ? findMatches(spanishText, regex) : [];

    if (germanMatches.length > 0 || spanishMatches.length > 0) {
      const matchedLanguage: 'german' | 'spanish' | 'both' = 
        germanMatches.length > 0 && spanishMatches.length > 0 ? 'both' :
        germanMatches.length > 0 ? 'german' : 'spanish';

      // Derivar el chapterId del formato interno (ej: "tod-in-venedig-ch2" -> "chapter-2")
      const chapterId = chapter.id.includes('-ch') 
        ? `chapter-${chapter.id.split('-ch')[1]}`
        : chapter.id;

      results.push({
        segmentId: segment.id,
        chapterId: chapterId,
        chapterTitle: chapter.title,
        segmentIndex: index,
        germanText,
        spanishText,
        matchedLanguage,
        matches: {
          german: germanMatches,
          spanish: spanishMatches,
        },
        query,
      });
    }
  });

  return results;
}

/**
 * Encuentra todas las coincidencias en un texto con su longitud exacta
 */
function findMatches(text: string, regex: RegExp): SearchMatch[] {
  const matches: SearchMatch[] = [];
  let match;
  
  // Reset regex lastIndex
  regex.lastIndex = 0;
  
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      text: match[0],
    });
    // Prevent infinite loop on zero-length matches
    if (match[0].length === 0) {
      regex.lastIndex++;
    }
  }
  
  return matches;
}

/**
 * Obtiene un extracto de texto alrededor de una coincidencia
 */
export function getTextExcerpt(
  text: string,
  match: SearchMatch,
  contextChars: number = 50
): { before: string; match: string; after: string } {
  const start = Math.max(0, match.index - contextChars);
  const end = Math.min(text.length, match.index + match.length + contextChars);
  
  const before = start > 0 ? '...' + text.slice(start, match.index).trimStart() : text.slice(start, match.index);
  const after = end < text.length ? text.slice(match.index + match.length, end).trimEnd() + '...' : text.slice(match.index + match.length, end);
  
  return { before, match: match.text, after };
}

/**
 * Resalta las coincidencias en un texto
 * Retorna segmentos de texto con información de si son coincidencias
 */
export function highlightMatches(
  text: string,
  matches: SearchMatch[]
): { text: string; isMatch: boolean }[] {
  if (matches.length === 0) {
    return [{ text, isMatch: false }];
  }

  const parts: { text: string; isMatch: boolean }[] = [];
  let lastIndex = 0;

  // Sort matches by index
  const sortedMatches = [...matches].sort((a, b) => a.index - b.index);

  for (const match of sortedMatches) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isMatch: false });
    }
    
    // Add match
    parts.push({ text: text.slice(match.index, match.index + match.length), isMatch: true });
    
    lastIndex = match.index + match.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isMatch: false });
  }

  return parts;
}

/**
 * Busca un query dentro de un texto y retorna todas las coincidencias
 * Útil para resaltar en el lector
 */
export function findQueryInText(
  text: string,
  query: string,
  caseSensitive: boolean = false
): SearchMatch[] {
  if (!query.trim()) return [];
  
  const regex = new RegExp(escapeRegExp(query.trim()), caseSensitive ? 'g' : 'gi');
  return findMatches(text, regex);
}
