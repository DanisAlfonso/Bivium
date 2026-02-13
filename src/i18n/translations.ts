export type Language = 'es' | 'de' | 'en';

export const translations = {
  es: {
    // Common
    appName: 'Lectio',
    cancel: 'Cancelar',
    close: 'Cerrar',
    save: 'Guardar',
    loading: 'Cargando...',
    
    // Library screen
    library: {
      title: 'Biblioteca',
      subtitle: 'Clásicos bilingües',
      read: 'Leer',
      continueReading: 'Continuar',
      percentRead: '% leído',
      chapters: 'capítulos',
      chapter: 'capítulo',
      comingSoon: 'Más obras próximamente',
      comingSoonSubtitle: 'Estamos preparando nuevos clásicos para ti',
    },
    
    // Chapters screen
    chapters: {
      title: 'Capítulos',
      loading: 'Cargando...',
      segment: 'Segmento',
      chapterNames: {
        1: 'Capítulo Primero',
        2: 'Capítulo Segundo',
        3: 'Capítulo Tercero',
        4: 'Capítulo Cuarto',
        5: 'Capítulo Quinto',
        default: 'Capítulo {{number}}',
      },
    },
    
    // Search screen
    search: {
      title: 'Buscar',
      placeholder: 'Buscar texto...',
      button: 'Buscar',
      noResults: 'No se encontraron resultados',
      tryDifferent: 'Intenta con otros términos de búsqueda',
      resultsFound: '{{count}} resultados encontrados',
      resultFound: '{{count}} resultado encontrado',
      segment: 'Segmento',
      chapter: 'Capítulo',
    },
    
    // Settings panel
    settings: {
      title: 'Ajustes de lectura',
      viewMode: {
        title: 'Modo de vista',
        parallel: 'Paralelo',
        immersive: 'Inmersivo',
        germanOnly: 'Solo alemán',
        spanishOnly: 'Solo español',
        parallelDesc: 'Alemán + español',
        immersiveDesc: 'Tap para revelar',
        germanOnlyDesc: 'Texto original',
        spanishOnlyDesc: 'Traducción',
      },
      navigation: {
        title: 'Navegación',
        continuous: 'Continuo',
        paginated: 'Paginado',
        continuousDesc: 'Scroll vertical',
        paginatedDesc: 'Deslizar horizontal',
      },
      translationStyle: {
        title: 'Estilo de traducción',
        subtitle: '¿Cómo mostrar la traducción?',
        inline: 'Inline',
        tooltip: 'Tooltip',
        inlineDesc: 'Debajo del texto',
        tooltipDesc: 'Carta flotante',
      },
      textAlignment: {
        title: 'Alineación del texto',
        left: 'Izquierda',
        justify: 'Justificado',
      },
      typography: {
        title: 'Tipografía',
        serif: 'Serif',
        sans: 'Sans',
        mono: 'Mono',
      },
      fontSize: {
        title: 'Tamaño de texto',
      },
      lineHeight: {
        title: 'Interlineado',
        compact: 'Compacto',
        normal: 'Normal',
        wide: 'Amplio',
        generous: 'Generoso',
      },
      language: {
        title: 'Idioma de la interfaz',
        es: 'Español',
        de: 'Alemán',
        en: 'Inglés',
      },
    },
    
    // Reader
    reader: {
      progress: 'Progreso',
      doubleTapHint: 'Doble tap para controles',
      tapHint: 'Toca para controles',
    },
  },
  
  de: {
    // Common
    appName: 'Lectio',
    cancel: 'Abbrechen',
    close: 'Schließen',
    save: 'Speichern',
    loading: 'Laden...',
    
    // Library screen
    library: {
      title: 'Bibliothek',
      subtitle: 'Bilinguale Klassiker',
      read: 'Lesen',
      continueReading: 'Weiterlesen',
      percentRead: '% gelesen',
      chapters: 'Kapitel',
      chapter: 'Kapitel',
      comingSoon: 'Weitere Werke folgen',
      comingSoonSubtitle: 'Wir bereiten neue Klassiker für Sie vor',
    },
    
    // Chapters screen
    chapters: {
      title: 'Kapitel',
      loading: 'Laden...',
      segment: 'Abschnitt',
      chapterNames: {
        1: 'Erstes Kapitel',
        2: 'Zweites Kapitel',
        3: 'Drittes Kapitel',
        4: 'Viertes Kapitel',
        5: 'Fünftes Kapitel',
        default: 'Kapitel {{number}}',
      },
    },
    
    // Search screen
    search: {
      title: 'Suchen',
      placeholder: 'Text suchen...',
      button: 'Suchen',
      noResults: 'Keine Ergebnisse gefunden',
      tryDifferent: 'Versuchen Sie es mit anderen Suchbegriffen',
      resultsFound: '{{count}} Ergebnisse gefunden',
      resultFound: '{{count}} Ergebnis gefunden',
      segment: 'Abschnitt',
      chapter: 'Kapitel',
    },
    
    // Settings panel
    settings: {
      title: 'Lese-Einstellungen',
      viewMode: {
        title: 'Ansichtsmodus',
        parallel: 'Parallel',
        immersive: 'Immersiv',
        germanOnly: 'Nur Deutsch',
        spanishOnly: 'Nur Spanisch',
        parallelDesc: 'Deutsch + Spanisch',
        immersiveDesc: 'Tippen zum Enthüllen',
        germanOnlyDesc: 'Originaltext',
        spanishOnlyDesc: 'Übersetzung',
      },
      navigation: {
        title: 'Navigation',
        continuous: 'Kontinuierlich',
        paginated: 'Paginiert',
        continuousDesc: 'Vertikales Scrollen',
        paginatedDesc: 'Horizontal wischen',
      },
      translationStyle: {
        title: 'Übersetzungsstil',
        subtitle: 'Wie soll die Übersetzung angezeigt werden?',
        inline: 'Inline',
        tooltip: 'Tooltip',
        inlineDesc: 'Unter dem Text',
        tooltipDesc: 'Schwebende Karte',
      },
      textAlignment: {
        title: 'Textausrichtung',
        left: 'Links',
        justify: 'Blocksatz',
      },
      typography: {
        title: 'Typografie',
        serif: 'Serif',
        sans: 'Sans',
        mono: 'Mono',
      },
      fontSize: {
        title: 'Schriftgröße',
      },
      lineHeight: {
        title: 'Zeilenabstand',
        compact: 'Kompakt',
        normal: 'Normal',
        wide: 'Weit',
        generous: 'Großzügig',
      },
      language: {
        title: 'Sprache',
        es: 'Spanisch',
        de: 'Deutsch',
        en: 'Englisch',
      },
    },
    
    // Reader
    reader: {
      progress: 'Fortschritt',
      doubleTapHint: 'Doppeltippen für Steuerung',
      tapHint: 'Tippen für Steuerung',
    },
  },
  
  en: {
    // Common
    appName: 'Lectio',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    loading: 'Loading...',
    
    // Library screen
    library: {
      title: 'Library',
      subtitle: 'Bilingual Classics',
      read: 'Read',
      continueReading: 'Continue',
      percentRead: '% read',
      chapters: 'chapters',
      chapter: 'chapter',
      comingSoon: 'More works coming soon',
      comingSoonSubtitle: 'We are preparing new classics for you',
    },
    
    // Chapters screen
    chapters: {
      title: 'Chapters',
      loading: 'Loading...',
      segment: 'Segment',
      chapterNames: {
        1: 'Chapter One',
        2: 'Chapter Two',
        3: 'Chapter Three',
        4: 'Chapter Four',
        5: 'Chapter Five',
        default: 'Chapter {{number}}',
      },
    },
    
    // Search screen
    search: {
      title: 'Search',
      placeholder: 'Search text...',
      button: 'Search',
      noResults: 'No results found',
      tryDifferent: 'Try different search terms',
      resultsFound: '{{count}} results found',
      resultFound: '{{count}} result found',
      segment: 'Segment',
      chapter: 'Chapter',
    },
    
    // Settings panel
    settings: {
      title: 'Reading Settings',
      viewMode: {
        title: 'View Mode',
        parallel: 'Parallel',
        immersive: 'Immersive',
        germanOnly: 'German Only',
        spanishOnly: 'Spanish Only',
        parallelDesc: 'German + Spanish',
        immersiveDesc: 'Tap to reveal',
        germanOnlyDesc: 'Original text',
        spanishOnlyDesc: 'Translation',
      },
      navigation: {
        title: 'Navigation',
        continuous: 'Continuous',
        paginated: 'Paginated',
        continuousDesc: 'Vertical scroll',
        paginatedDesc: 'Horizontal swipe',
      },
      translationStyle: {
        title: 'Translation Style',
        subtitle: 'How to display the translation?',
        inline: 'Inline',
        tooltip: 'Tooltip',
        inlineDesc: 'Below text',
        tooltipDesc: 'Floating card',
      },
      textAlignment: {
        title: 'Text Alignment',
        left: 'Left',
        justify: 'Justify',
      },
      typography: {
        title: 'Typography',
        serif: 'Serif',
        sans: 'Sans',
        mono: 'Mono',
      },
      fontSize: {
        title: 'Font Size',
      },
      lineHeight: {
        title: 'Line Height',
        compact: 'Compact',
        normal: 'Normal',
        wide: 'Wide',
        generous: 'Generous',
      },
      language: {
        title: 'Interface Language',
        es: 'Spanish',
        de: 'German',
        en: 'English',
      },
    },
    
    // Reader
    reader: {
      progress: 'Progress',
      doubleTapHint: 'Double tap for controls',
      tapHint: 'Tap for controls',
    },
  },
} as const;

export type Translations = typeof translations;
