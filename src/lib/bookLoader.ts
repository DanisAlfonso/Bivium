import { Chapter, Book } from '../types';

// Cache simple para evitar cargas repetidas
const chapterCache: Map<string, Chapter> = new Map();
const bookCache: Map<string, Book> = new Map();

/**
 * Carga un capítulo desde un archivo JSON
 * @param bookId - ID del libro (ej: 'tod-in-venedig')
 * @param chapterId - ID del capítulo (ej: 'chapter-1')
 * @returns Promise<Chapter>
 */
export async function loadChapter(bookId: string, chapterId: string): Promise<Chapter> {
  const cacheKey = `${bookId}/${chapterId}`;
  
  if (chapterCache.has(cacheKey)) {
    return chapterCache.get(cacheKey)!;
  }

  try {
    // Importación dinámica del JSON
    const module = await import(`../books/${bookId}/${chapterId}.json`);
    const chapter: Chapter = module.default || module;
    
    chapterCache.set(cacheKey, chapter);
    return chapter;
  } catch (error) {
    console.error(`Error loading chapter ${chapterId} from book ${bookId}:`, error);
    throw new Error(`No se pudo cargar el capítulo ${chapterId}`);
  }
}

/**
 * Carga la metadata de un libro
 * @param bookId - ID del libro
 * @returns Promise<Book>
 */
export async function loadBook(bookId: string): Promise<Book> {
  if (bookCache.has(bookId)) {
    return bookCache.get(bookId)!;
  }

  try {
    const module = await import(`../books/${bookId}/book.json`);
    const book: Book = module.default || module;
    
    bookCache.set(bookId, book);
    return book;
  } catch (error) {
    console.error(`Error loading book ${bookId}:`, error);
    throw new Error(`No se pudo cargar el libro ${bookId}`);
  }
}

/**
 * Carga todos los capítulos de un libro
 * @param bookId - ID del libro
 * @returns Promise<Chapter[]>
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
 * Nota: En el futuro esto podría venir de una API o base de datos
 */
export async function listAvailableBooks(): Promise<{ id: string; title: { de: string; es: string }; author: { de: string; es: string } }[]> {
  // Por ahora, lista hardcodeada de libros disponibles
  // En el futuro esto podría escanear la carpeta books/
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
