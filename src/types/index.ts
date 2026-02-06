export interface TextSegment {
  id: string;
  german: string[];
  spanish: string[];
  isParagraphStart?: boolean;
}

export interface Chapter {
  id: string;
  title: { de: string; es: string };
  author: { de: string; es: string };
  bookTitle: { de: string; es: string };
  segments: TextSegment[];
}

export interface Book {
  id: string;
  title: { de: string; es: string };
  author: { de: string; es: string };
  chapters: string[]; // IDs de capítulos
  coverImage?: string;
}

export type FontFamily = 'merriweather' | 'lora' | 'literata' | 'crimson' | 'inter' | 'sourceSans' | 'lato' | 'jetbrains';

export interface FontOption {
  value: FontFamily;
  displayName: string;
  family: string;
  category: 'serif' | 'sans' | 'mono';
}

export type ViewMode = 'parallel' | 'german-only' | 'spanish-only' | 'immersive';

export type TextAlignment = 'left' | 'justify';

export type TranslationStyle = 'inline' | 'tooltip';

export interface ReadingProgress {
  chapterId: string;
  segmentIndex: number;
  lastReadAt: number;
}

export interface UserSettings {
  fontFamily: FontFamily;
  fontSize: number;
  lineHeight: number;
  theme: 'light' | 'dark' | 'system';
  viewMode: ViewMode;
  textAlignment: TextAlignment;
  translationStyle: TranslationStyle;
}
