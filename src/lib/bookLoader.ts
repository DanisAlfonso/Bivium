import { Chapter, Book } from '../types';

// Cache simple para evitar cargas repetidas
const chapterCache: Map<string, Chapter> = new Map();
const bookCache: Map<string, Book> = new Map();

/**
 * Carga un capítulo desde un archivo JSON usando require
 * Nota: Metro bundler requiere rutas estáticas, por eso usamos require
 */
export function loadChapter(bookId: string, chapterId: string): Promise<Chapter> {
  const cacheKey = `${bookId}/${chapterId}`;
  
  if (chapterCache.has(cacheKey)) {
    return Promise.resolve(chapterCache.get(cacheKey)!);
  }

  return new Promise((resolve, reject) => {
    try {
      // Importación síncrona con require (compatible con Metro)
      // Las rutas deben ser relativas y conocidas en tiempo de compilación
      let chapter: Chapter;
      
      if (bookId === 'tod-in-venedig' && chapterId === 'chapter-1') {
        chapter = require('../books/tod-in-venedig/chapter-1.json');
      } else {
        throw new Error(`Capítulo no encontrado: ${bookId}/${chapterId}`);
      }
      
      chapterCache.set(cacheKey, chapter);
      resolve(chapter);
    } catch (error) {
      console.error(`Error loading chapter ${chapterId} from book ${bookId}:`, error);
      reject(new Error(`No se pudo cargar el capítulo ${chapterId}`));
    }
  });
}

/**
 * Carga la metadata de un libro
 */
export function loadBook(bookId: string): Promise<Book> {
  if (bookCache.has(bookId)) {
    return Promise.resolve(bookCache.get(bookId)!);
  }

  return new Promise((resolve, reject) => {
    try {
      let book: Book;
      
      if (bookId === 'tod-in-venedig') {
        book = require('../books/tod-in-venedig/book.json');
      } else {
        throw new Error(`Libro no encontrado: ${bookId}`);
      }
      
      bookCache.set(bookId, book);
      resolve(book);
    } catch (error) {
      console.error(`Error loading book ${bookId}:`, error);
      reject(new Error(`No se pudo cargar el libro ${bookId}`));
    }
  });
}

/**
 * Carga todos los capítulos de un libro
 */
export async function loadAllChapters(bookId: string): Promise<Chapter[]> {
  const book = await loadBook(bookId);
  const chapters: Chapter[] = [];
  
  for (const chapterId of book.chapters) {
    const chapter = await loadChapter(bookId, chapterId);
    chapters.push(chapter);
  }
  
  return chapters;
}

/**
 * Lista todos los libros disponibles
 */
export async function listAvailableBooks(): Promise<{ id: string; title: { de: string; es: string }; author: { de: string; es: string } }[]> {
  return [
    {
      id: 'tod-in-venedig',
      title: { de: 'Der Tod in Venedig', es: 'La muerte en Venecia' },
      author: { de: 'Thomas Mann', es: 'Thomas Mann' }
    }
  ];
}

// Para compatibilidad hacia atrás durante la transición
export { loadChapter as loadChapterData };
