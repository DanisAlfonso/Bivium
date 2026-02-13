import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  Animated,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chapter, TextSegment, WordMapping } from '../types';
import { lightTheme, darkTheme } from '../constants/theme';
import { fontOptions } from '../constants/fonts';
import { useSettings } from '../hooks/useSettings';
import { useProgress } from '../hooks/useProgress';
import { ReaderHeader } from './ReaderHeader';
import { SettingsPanel } from './SettingsPanel';
import * as NavigationBar from 'expo-navigation-bar';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { webFontCSS } from '../constants/webFonts';

interface PaginatedReaderProps {
  chapter: Chapter;
  onBack: () => void;
  initialSegmentId?: string;
  initialSegmentIndex?: number;
  searchQuery?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 110;

interface PageData {
  id: string;
  segments: TextSegment[];
  pageNumber: number;
  totalPages: number;
}

// Función para obtener los índices mapeados
const getMappedIndices = (mapping: WordMapping[] | undefined, wordIndex: number, lang: 'de' | 'es'): number[] => {
  if (!mapping) return [];
  for (const map of mapping) {
    const srcIndices = Array.isArray(map[lang]) ? map[lang] : [map[lang]];
    if (srcIndices.includes(wordIndex)) {
      const targetLang = lang === 'de' ? 'es' : 'de';
      const targetIndices = Array.isArray(map[targetLang]) ? map[targetLang] : [map[targetLang]];
      return targetIndices;
    }
  }
  return [];
};

// Función para verificar si una palabra tiene mapping
const hasMappingForWord = (mapping: WordMapping[] | undefined, wordIndex: number, lang: 'de' | 'es'): boolean => {
  if (!mapping) return false;
  return getMappedIndices(mapping, wordIndex, lang).length > 0;
};

// Agrupar segmentos en párrafos
function groupSegmentsIntoParagraphs(segments: TextSegment[]): TextSegment[][] {
  const paragraphs: TextSegment[][] = [];
  let currentParagraph: TextSegment[] = [];

  for (const segment of segments) {
    if (segment.isParagraphStart && currentParagraph.length > 0) {
      paragraphs.push(currentParagraph);
      currentParagraph = [];
    }
    currentParagraph.push(segment);
  }

  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph);
  }

  return paragraphs;
}

export function PaginatedReader({ chapter, onBack, initialSegmentId, initialSegmentIndex, searchQuery }: PaginatedReaderProps) {

  
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const [headerVisible, setHeaderVisible] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRestoredProgress = useRef(false);

  // Estado para el mapping de palabras
  const [highlightedWord, setHighlightedWord] = useState<{segmentId: string, wordIndex: number, lang: 'de' | 'es'} | null>(null);
  const [revealedSegmentId, setRevealedSegmentId] = useState<string | null>(initialSegmentId || null);

  const {
    settings,
    isLoading: settingsLoading,
    setFontFamily,
    setFontSize,
    setLineHeight,
    setViewMode,
    setTextAlignment,
    setTranslationStyle,
    setNavigationMode,
  } = useSettings();

  const { progress, saveProgress } = useProgress(chapter.id);


  const currentFont = fontOptions.find(f => f.value === settings.fontFamily);
  const fontFamily = currentFont?.family.split(',')[0] || 'System';
  const fontFamilyId = currentFont?.value || 'merriweather';

  const isImmersiveMode = settings.viewMode === 'immersive';
  const isParallelMode = settings.viewMode === 'parallel';
  const isGermanOnly = settings.viewMode === 'german-only';
  const isSpanishOnly = settings.viewMode === 'spanish-only';

  // Ocultar barra de navegación de Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
    }
    return () => {
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible');
      }
    };
  }, []);

  // Calcular páginas basado en cantidad de texto
  const pages = useMemo(() => {
    const allSegments = chapter.segments;
    const pagesData: PageData[] = [];
    
    // Para modos de un solo idioma, usar segmentos directamente (más simple y seguro)
    if (isGermanOnly || isSpanishOnly) {
      let MAX_CHARS_PER_PAGE = 500;
      const MIN_SEGMENTS_PER_PAGE = 3;
      const MAX_SEGMENTS_PER_PAGE = 10;
      
      let pageNumber = 1;
      let currentPageSegments: TextSegment[] = [];
      let currentPageChars = 0;
      
      for (let i = 0; i < allSegments.length; i++) {
        const segment = allSegments[i];
        const segmentChars = isGermanOnly 
          ? segment.german.join(' ').length 
          : segment.spanish.join(' ').length;
        
        const wouldExceedMaxChars = (currentPageChars + segmentChars) > MAX_CHARS_PER_PAGE;
        const hasMinSegments = currentPageSegments.length >= MIN_SEGMENTS_PER_PAGE;
        const hasMaxSegments = currentPageSegments.length >= MAX_SEGMENTS_PER_PAGE;
        
        if ((wouldExceedMaxChars && hasMinSegments) || hasMaxSegments) {
          pagesData.push({
            id: `page-${pageNumber}`,
            segments: currentPageSegments,
            pageNumber,
            totalPages: 0,
          });
          currentPageSegments = [];
          currentPageChars = 0;
          pageNumber++;
        }
        
        currentPageSegments.push(segment);
        currentPageChars += segmentChars;
      }
      
      if (currentPageSegments.length > 0) {
        pagesData.push({
          id: `page-${pageNumber}`,
          segments: currentPageSegments,
          pageNumber,
          totalPages: 0,
        });
      }
    } else {
      // Modo Paralelo o Inmersivo: usar segmentos individuales
      let MAX_CHARS_PER_PAGE = 400;
      if (isImmersiveMode) {
        MAX_CHARS_PER_PAGE = 600;
      }
      
      const MIN_SEGMENTS_PER_PAGE = 2;
      const MAX_SEGMENTS_PER_PAGE = isImmersiveMode ? 12 : 8;
      
      let pageNumber = 1;
      let currentPageSegments: TextSegment[] = [];
      let currentPageChars = 0;
      
      for (let i = 0; i < allSegments.length; i++) {
        const segment = allSegments[i];
        const segmentChars = segment.german.join(' ').length + segment.spanish.join(' ').length;
        
        const wouldExceedMaxChars = (currentPageChars + segmentChars) > MAX_CHARS_PER_PAGE;
        const hasMinSegments = currentPageSegments.length >= MIN_SEGMENTS_PER_PAGE;
        const hasMaxSegments = currentPageSegments.length >= MAX_SEGMENTS_PER_PAGE;
        
        if ((wouldExceedMaxChars && hasMinSegments) || hasMaxSegments) {
          pagesData.push({
            id: `page-${pageNumber}`,
            segments: currentPageSegments,
            pageNumber,
            totalPages: 0,
          });
          currentPageSegments = [];
          currentPageChars = 0;
          pageNumber++;
        }
        
        currentPageSegments.push(segment);
        currentPageChars += segmentChars;
      }
      
      if (currentPageSegments.length > 0) {
        pagesData.push({
          id: `page-${pageNumber}`,
          segments: currentPageSegments,
          pageNumber,
          totalPages: 0,
        });
      }
    }

    const total = pagesData.length;
    pagesData.forEach(page => page.totalPages = total);

    return pagesData;
  }, [chapter.segments, isImmersiveMode, isGermanOnly, isSpanishOnly]);

  // Restaurar progreso - solo una vez al montar
  useEffect(() => {

    if (hasRestoredProgress.current || pages.length === 0) return;
    
    // Prioridad 1: initialSegmentId (desde búsqueda)
    if (initialSegmentId) {

      const pageIndex = pages.findIndex(page =>
        page.segments.some(seg => seg.id === initialSegmentId)
      );

      if (pageIndex >= 0) {
        setTimeout(() => {

          flatListRef.current?.scrollToIndex({ index: pageIndex, animated: false });
          setCurrentPageIndex(pageIndex);
          hasRestoredProgress.current = true;
        }, 200);
      } else {
        hasRestoredProgress.current = true;
      }
    } 
    // Prioridad 2: initialSegmentIndex (desde chapters)
    else if (initialSegmentIndex !== undefined && initialSegmentIndex > 0) {

      let segmentCount = 0;
      let targetPageIndex = 0;
      for (let i = 0; i < pages.length; i++) {
        segmentCount += pages[i].segments.length;
        if (segmentCount > initialSegmentIndex) {
          targetPageIndex = i;
          break;
        }
      }
      const safeIndex = Math.min(targetPageIndex, pages.length - 1);

      setTimeout(() => {

        flatListRef.current?.scrollToIndex({ index: safeIndex, animated: false });
        setCurrentPageIndex(safeIndex);
        hasRestoredProgress.current = true;
      }, 200);
    }
    // Prioridad 3: progreso guardado en AsyncStorage
    else if (progress && progress.segmentIndex > 0) {

      let segmentCount = 0;
      let targetPageIndex = 0;
      for (let i = 0; i < pages.length; i++) {
        segmentCount += pages[i].segments.length;
        if (segmentCount > progress.segmentIndex) {
          targetPageIndex = i;
          break;
        }
      }
      const safeIndex = Math.min(targetPageIndex, pages.length - 1);

      setTimeout(() => {

        flatListRef.current?.scrollToIndex({ index: safeIndex, animated: false });
        setCurrentPageIndex(safeIndex);
        hasRestoredProgress.current = true;
      }, 200);
    } else {

      hasRestoredProgress.current = true;
    }
  }, [initialSegmentId, initialSegmentIndex, progress, pages]);

  // Refs para tener acceso a los valores actuales en la cleanup function
  const currentPageIndexRef = useRef(currentPageIndex);
  const pagesRef = useRef(pages);
  
  // Actualizar refs cuando cambian los valores
  useEffect(() => {
    currentPageIndexRef.current = currentPageIndex;
  }, [currentPageIndex]);
  
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  // Guardar al desmontar usando refs para acceder a los valores actuales
  useEffect(() => {
    return () => {
      const pageIndex = currentPageIndexRef.current;
      const currentPages = pagesRef.current;
      if (currentPages[pageIndex]) {
        let segmentIndex = 0;
        for (let i = 0; i < pageIndex; i++) {
          segmentIndex += currentPages[i].segments.length;
        }
        saveProgress(segmentIndex);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveProgress]);

  // Animación del header
  const animateHeader = useCallback((show: boolean) => {
    setHeaderVisible(show);
    if (show) {
      setShowHint(false);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    }
    Animated.timing(headerTranslateY, {
      toValue: show ? 0 : -HEADER_HEIGHT - 20,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [headerTranslateY]);

  const scheduleHide = useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      animateHeader(false);
      setShowHint(true);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = setTimeout(() => setShowHint(false), 4000);
    }, 2500);
  }, [animateHeader]);

  const toggleHeader = useCallback(() => {
    if (headerVisible) {
      animateHeader(false);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    } else {
      animateHeader(true);
      scheduleHide();
    }
  }, [headerVisible, animateHeader, scheduleHide]);

  useEffect(() => {
    animateHeader(true);
    scheduleHide();
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, [animateHeader, scheduleHide]);

  const handleScroll = useCallback((event: any) => {
    // Ignorar scroll durante la restauración inicial
    if (!hasRestoredProgress.current) return;
    
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (pageIndex !== currentPageIndex && pageIndex >= 0 && pageIndex < pages.length) {

      setCurrentPageIndex(pageIndex);
      // Guardar progreso INMEDIATAMENTE cuando cambia la página
      if (pages[pageIndex]) {
        let segmentIndex = 0;
        for (let i = 0; i < pageIndex; i++) {
          segmentIndex += pages[i].segments.length;
        }

        saveProgress(segmentIndex);
      }
    }
  }, [currentPageIndex, pages, saveProgress]);

  // Handler para tocar palabras (solo en modo paralelo)
  const handleWordTouch = (segment: TextSegment, wordIndex: number, lang: 'de' | 'es') => {
    if (segment.mapping && segment.mapping.length > 0) {
      if (
        highlightedWord &&
        highlightedWord.segmentId === segment.id &&
        highlightedWord.wordIndex === wordIndex &&
        highlightedWord.lang === lang
      ) {
        setHighlightedWord(null);
      } else {
        setHighlightedWord({ segmentId: segment.id, wordIndex, lang });
      }
    }
  };

  const isWordHighlighted = (segmentId: string, wordIndex: number, lang: 'de' | 'es'): boolean => {
    if (!highlightedWord || highlightedWord.segmentId !== segmentId) return false;
    if (highlightedWord.lang === lang) {
      return highlightedWord.wordIndex === wordIndex;
    } else {
      const mappedIndices = getMappedIndices(
        pages.flatMap(p => p.segments).find(s => s.id === segmentId)?.mapping,
        highlightedWord.wordIndex,
        highlightedWord.lang
      );
      return mappedIndices.includes(wordIndex);
    }
  };

  const androidTextProps = Platform.OS === 'android' ? {
    textBreakStrategy: 'simple' as const,
    dataDetectorType: 'none' as const,
  } : {};

  // Generar HTML para modo inmersivo
  const generateImmersiveHTML = (segments: TextSegment[]) => {
    const textAlign = settings.textAlignment === 'justify' ? 'justify' : 'left';
    const isTooltip = settings.translationStyle === 'tooltip';
    
    const translationsMap: Record<string, string> = {};
    segments.forEach(s => {
      translationsMap[s.id] = s.spanish.join(' ');
    });
    
    if (isTooltip) {
      const segmentsHtml = segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const space = !isLast ? ' ' : '';
        const text = segment.german.join(' ');
        return `<span class="seg" id="seg-${segment.id}" data-id="${segment.id}">${text}${space}</span>`;
      }).join('');
      
      return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: '${fontFamilyId}', Georgia, serif;
      font-size: ${settings.fontSize}px;
      line-height: ${settings.lineHeight};
      color: ${theme.germanText};
      background: ${theme.background};
      margin: 0;
      padding: 0 4px;
    }
    .paragraph { text-align: ${textAlign}; margin: 0; padding: 0; }
    .seg {
      cursor: pointer;
      padding: 2px 0;
      border-radius: 3px;
      transition: background 0.15s;
    }
    .seg:active, .seg.revealed { background: ${theme.highlight}; }
    .tooltip {
      position: absolute;
      background: ${theme.surface};
      border: 1px solid ${theme.border};
      border-radius: 8px;
      padding: 10px 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      min-width: 120px;
      max-width: 90%;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease;
    }
    .tooltip.visible { opacity: 1; visibility: visible; }
    .tooltip-text { font-style: italic; color: ${theme.spanishText}; font-size: ${settings.fontSize * 0.92}px; }
  </style>
</head>
<body>
  <div class="paragraph">${segmentsHtml}</div>
  <div class="tooltip" id="active-tooltip"><span class="tooltip-text"></span></div>
  <script>
    window.translations = ${JSON.stringify(translationsMap)};
    (function() {
      var initialFont = document.createElement('style');
      initialFont.id = 'dynamic-fonts';
      initialFont.textContent = \`${webFontCSS[fontFamilyId] || ''}\`;
      document.head.appendChild(initialFont);
      document.body.style.fontFamily = '${fontFamilyId}, Georgia, serif';
      
      const translations = window.translations;
      const tooltip = document.getElementById('active-tooltip');
      const tooltipText = tooltip.querySelector('.tooltip-text');
      let currentId = null;
      
      function showTooltip(el, id) {
        const rect = el.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        tooltipText.textContent = translations[id];
        tooltip.classList.add('visible');
        const tooltipRect = tooltip.getBoundingClientRect();
        const vw = window.innerWidth;
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        left = Math.max(8, Math.min(left, vw - tooltipRect.width - 8));
        let top = rect.bottom + scrollTop + 8;
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
      }
      
      function hideTooltip() {
        tooltip.classList.remove('visible');
        document.querySelectorAll('.seg').forEach(s => s.classList.remove('revealed'));
        currentId = null;
      }
      
      let lastTap = 0, lastTapId = null;
      document.querySelectorAll('.seg').forEach(el => {
        el.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const id = this.getAttribute('data-id');
          const now = Date.now();
          
          // Detectar doble tap
          if (now - lastTap < 300 && lastTapId === id) {
            window.ReactNativeWebView.postMessage(JSON.stringify({type: 'doubleTap'}));
          } else {
            if (currentId === id) {
              hideTooltip();
            } else {
              hideTooltip();
              this.classList.add('revealed');
              showTooltip(this, id);
              currentId = id;
            }
            window.ReactNativeWebView.postMessage(JSON.stringify({type: 'segmentTap', segmentId: id}));
          }
          lastTap = now;
          lastTapId = id;
        });
      });
      
      document.addEventListener('click', function(e) {
        if (!e.target.classList.contains('seg')) hideTooltip();
      });
      
      if (document.fonts) {
        document.fonts.ready.then(function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({type: 'height', height: document.body.scrollHeight}));
        });
      }
    })();
  </script>
</body>
</html>`;
    } else {
      // Inline mode
      const segmentsHtml = segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const space = !isLast ? ' ' : '';
        const text = segment.german.join(' ');
        const trans = segment.spanish.join(' ');
        return `<span class="s" id="s-${segment.id}" data-id="${segment.id}">${text}${space}</span><i class="t" id="t-${segment.id}">${trans}</i>`;
      }).join('');
      
      return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: '${fontFamilyId}', Georgia, serif;
      font-size: ${settings.fontSize}px;
      line-height: ${settings.lineHeight};
      color: ${theme.germanText};
      background: ${theme.background};
      margin: 0;
      padding: 0 4px;
    }
    p { text-align: ${textAlign}; margin: 0; padding: 5px 0; }
    .s { cursor: pointer; padding: 2px 0; border-radius: 3px; transition: background 0.15s; }
    .s:hover, .s.revealed { background: ${theme.highlight}; }
    .t { display: none; font-style: italic; color: ${theme.spanishText}; font-size: ${settings.fontSize * 0.95}px; margin: 4px 0 8px 8px; padding: 4px 8px; border-left: 3px solid ${theme.accent}; }
    .t.visible { display: inline-block; }
  </style>
</head>
<body>
  <p>${segmentsHtml}</p>
  <script>
    (function() {
      var initialFont = document.createElement('style');
      initialFont.id = 'dynamic-fonts';
      initialFont.textContent = \`${webFontCSS[fontFamilyId] || ''}\`;
      document.head.appendChild(initialFont);
      document.body.style.fontFamily = '${fontFamilyId}, Georgia, serif';
      
      let currentId = null;
      let lastTap = 0, lastTapId = null;
      document.querySelectorAll('.s').forEach(el => {
        el.addEventListener('click', function(e) {
          e.preventDefault();
          const id = this.getAttribute('data-id');
          const now = Date.now();
          
          // Detectar doble tap
          if (now - lastTap < 300 && lastTapId === id) {
            window.ReactNativeWebView.postMessage(JSON.stringify({type: 'doubleTap'}));
          } else {
            document.querySelectorAll('.t').forEach(t => t.classList.remove('visible'));
            document.querySelectorAll('.s').forEach(s => s.classList.remove('revealed'));
            if (currentId !== id) {
              document.getElementById('t-' + id).classList.add('visible');
              this.classList.add('revealed');
              currentId = id;
            } else {
              currentId = null;
            }
            window.ReactNativeWebView.postMessage(JSON.stringify({type: 'segmentTap', segmentId: id}));
          }
          lastTap = now;
          lastTapId = id;
          
          setTimeout(() => {
            window.ReactNativeWebView.postMessage(JSON.stringify({type: 'height', height: document.body.scrollHeight}));
          }, 250);
        });
      });
      
      if (document.fonts) {
        document.fonts.ready.then(function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({type: 'height', height: document.body.scrollHeight}));
        });
      }
    })();
  </script>
</body>
</html>`;
    }
  };

  // Renderizar contenido según el modo de vista
  const renderPageContent = (page: PageData) => {
    const baseTextStyle = {
      fontFamily,
      fontSize: settings.fontSize,
      lineHeight: settings.fontSize * settings.lineHeight,
    };

    // Modo Inmersivo
    if (isImmersiveMode) {
      return (
        <ImmersivePageContent 
          segments={page.segments}
          html={generateImmersiveHTML(page.segments)}
          theme={theme}
          onToggleReveal={(id) => setRevealedSegmentId(prev => prev === id ? null : id)}
          onDoubleTap={toggleHeader}
          searchQuery={searchQuery}
        />
      );
    }

    // Modo Solo Alemán - agrupar segmentos de la página en párrafos
    if (isGermanOnly) {
      const paragraphs = groupSegmentsIntoParagraphs(page.segments);
      return (
        <View style={styles.pageContent}>
          {paragraphs.map((paragraph, idx) => {
            // Unir todos los segmentos del párrafo en un solo texto
            const paragraphText = paragraph.map(s => s.german.join(' ')).join(' ');
            return (
              <View key={`para-${idx}`} style={idx > 0 ? styles.paragraphSpacing : null}>
                <Text style={[baseTextStyle, styles.paragraphText, { color: theme.germanText, textAlign: settings.textAlignment as any }]}>
                  {paragraphText}
                </Text>
              </View>
            );
          })}
        </View>
      );
    }

    // Modo Solo Español - agrupar segmentos de la página en párrafos  
    if (isSpanishOnly) {
      const paragraphs = groupSegmentsIntoParagraphs(page.segments);
      return (
        <View style={styles.pageContent}>
          {paragraphs.map((paragraph, idx) => {
            // Unir todos los segmentos del párrafo en un solo texto
            const paragraphText = paragraph.map(s => s.spanish.join(' ')).join(' ');
            return (
              <View key={`para-${idx}`} style={idx > 0 ? styles.paragraphSpacing : null}>
                <Text style={[baseTextStyle, styles.paragraphText, { color: theme.spanishText, textAlign: settings.textAlignment as any }]}>
                  {paragraphText}
                </Text>
              </View>
            );
          })}
        </View>
      );
    }

    // Modo Paralelo (default)
    return (
      <View style={styles.pageContent}>
        {page.segments.map((segment, idx) => {
          const hasMapping = segment.mapping && segment.mapping.length > 0;
          
          return (
            <View key={segment.id} style={idx > 0 && styles.segmentSpacing}>
              {/* Texto alemán */}
              <Text style={[styles.germanText, baseTextStyle, { color: theme.germanText }]} {...androidTextProps}>
                {segment.german.map((word, wordIdx) => {
                  const isHighlighted = isWordHighlighted(segment.id, wordIdx, 'de');
                  const hasWordMapping = hasMapping && hasMappingForWord(segment.mapping, wordIdx, 'de');
                  
                  return (
                    <Text
                      key={`de-${wordIdx}`}
                      onPress={hasWordMapping ? () => handleWordTouch(segment, wordIdx, 'de') : undefined}
                      style={{
                        textDecorationLine: isHighlighted ? 'underline' : 'none',
                        textDecorationColor: theme.accent,
                        textDecorationStyle: 'solid',
                        color: isHighlighted ? theme.accent : theme.germanText,
                      }}
                    >
                      {word + ' '}
                    </Text>
                  );
                })}
              </Text>

              {/* Texto español */}
              <Text style={[styles.spanishText, baseTextStyle, { 
                color: theme.spanishText, 
                fontSize: settings.fontSize * 0.80,
                opacity: 0.7,
                fontWeight: '300'
              }]} {...androidTextProps}>
                {segment.spanish.map((word, wordIdx) => {
                  const isHighlighted = isWordHighlighted(segment.id, wordIdx, 'es');
                  const hasWordMapping = hasMapping && hasMappingForWord(segment.mapping, wordIdx, 'es');
                  
                  return (
                    <Text
                      key={`es-${wordIdx}`}
                      onPress={hasWordMapping ? () => handleWordTouch(segment, wordIdx, 'es') : undefined}
                      style={{
                        textDecorationLine: isHighlighted ? 'underline' : 'none',
                        textDecorationColor: theme.accent,
                        textDecorationStyle: 'solid',
                        color: isHighlighted ? theme.accent : theme.spanishText,
                      }}
                    >
                      {word + ' '}
                    </Text>
                  );
                })}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderPage = ({ item: page }: { item: PageData }) => {
    // En modo inmersivo, el WebView maneja su propio tap, así que no usamos onPress aquí
    const isImmersive = settings.viewMode === 'immersive';
    return (
      <Pressable 
        onPress={isImmersive ? undefined : toggleHeader} 
        style={styles.page}
      >
        <View style={styles.pageInner}>
          {renderPageContent(page)}
        </View>
      </Pressable>
    );
  };

  const progressPercent = pages.length > 0
    ? Math.min(100, Math.round(((currentPageIndex + 1) / pages.length) * 100))
    : 0;

  const headerTranslateYValue = headerTranslateY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -HEADER_HEIGHT],
  });

  // Handler para el botón atrás - guarda progreso antes de navegar
  const handleBack = useCallback(() => {

    // Guardar progreso actual antes de salir
    if (pages[currentPageIndex]) {
      let segmentIndex = 0;
      for (let i = 0; i < currentPageIndex; i++) {
        segmentIndex += pages[i].segments.length;
      }

      saveProgress(segmentIndex);
    }

    // Llamar al onBack original
    onBack();
  }, [currentPageIndex, pages, saveProgress, onBack]);

  if (settingsLoading) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        style={[styles.headerContainer, { transform: [{ translateY: headerTranslateYValue }] }]}
        pointerEvents={headerVisible ? 'auto' : 'none'}
      >
        <ReaderHeader
          chapter={chapter}
          onBack={handleBack}
          onOpenSettings={() => setSettingsVisible(true)}
          progress={progressPercent}
        />
      </Animated.View>

      {!headerVisible && showHint && (
        <View style={[styles.hintContainer, { backgroundColor: theme.surface + 'CC' }]}>
          <Text style={[styles.hintText, { color: theme.textSecondary }]}>
            Toca para controles
          </Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderPage}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + insets.top + 10,
          paddingBottom: insets.bottom + 20,
        }}
      />

      <SettingsPanel
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        fontFamily={settings.fontFamily}
        fontSize={settings.fontSize}
        lineHeight={settings.lineHeight}
        viewMode={settings.viewMode}
        textAlignment={settings.textAlignment}
        translationStyle={settings.translationStyle}
        navigationMode={settings.navigationMode}
        onFontFamilyChange={setFontFamily}
        onFontSizeChange={setFontSize}
        onLineHeightChange={setLineHeight}
        onViewModeChange={setViewMode}
        onTextAlignmentChange={setTextAlignment}
        onTranslationStyleChange={setTranslationStyle}
        onNavigationModeChange={setNavigationMode}
      />



      <View style={[styles.pageIndicator, { bottom: Math.max(insets.bottom, 8) + 8 }]}>
        <Text style={[styles.pageIndicatorText, { color: theme.textMuted }]}>
          {currentPageIndex + 1} / {pages.length}
        </Text>
      </View>
    </View>
  );
}

// Componente para contenido inmersivo con WebView
interface ImmersivePageContentProps {
  segments: TextSegment[];
  html: string;
  theme: any;
  onToggleReveal: (id: string) => void;
  onDoubleTap?: () => void;
  searchQuery?: string;
}

function ImmersivePageContent({ segments, html, theme, onToggleReveal, onDoubleTap }: ImmersivePageContentProps) {
  const [webViewHeight, setWebViewHeight] = useState(100);
  
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'segmentTap') {
        onToggleReveal(data.segmentId);
      } else if (data.type === 'height') {
        setWebViewHeight(Math.max(20, data.height));
      } else if (data.type === 'doubleTap' && onDoubleTap) {
        onDoubleTap();
      }
    } catch {}
  };

  return (
    <View style={styles.pageContent}>
      <WebView
        source={{ html }}
        style={{ 
          height: webViewHeight,
          backgroundColor: 'transparent',
        }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={handleMessage}
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  hintContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 8,
    zIndex: 50,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '500',
  },
  pageIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 90,
  },
  pageIndicatorText: {
    fontSize: 11,
    fontWeight: '400',
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  pageInner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  pageContent: {
    flex: 1,
  },
  segmentSpacing: {
    marginTop: 16,
  },
  paragraphSpacing: {
    marginTop: 16,
  },
  paragraphText: {
    marginBottom: 8,
  },
  germanText: {
    marginBottom: 0,
  },
  spanishText: {
    marginBottom: 0,
  },
});
