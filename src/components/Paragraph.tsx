import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, LayoutChangeEvent } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { TextSegment, ViewMode, TextAlignment, TranslationStyle, WordMapping } from '../types';
import { Theme } from '../constants/theme';
import { webFontCSS } from '../constants/webFonts';
import { fontOptions } from '../constants/fonts';

interface ParagraphProps {
  segments: TextSegment[];
  paragraphIndex: number;
  viewMode: ViewMode;
  textAlignment: TextAlignment;
  translationStyle: TranslationStyle;
  revealedSegmentId: string | null;
  onToggleReveal: (segmentId: string) => void;
  onDoubleTap?: () => void;
  onLayout?: (index: number, y: number) => void;
  theme: Theme;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  isFirst: boolean;
  searchQuery?: string;
}

export function Paragraph({
  segments,
  paragraphIndex,
  viewMode,
  textAlignment,
  translationStyle,
  revealedSegmentId,
  onToggleReveal,
  onDoubleTap,
  onLayout,
  theme,
  fontFamily,
  fontSize,
  lineHeight,
  isFirst,
  searchQuery,
}: ParagraphProps) {
  const [webViewHeight, setWebViewHeight] = useState(100);
  const [highlightedWord, setHighlightedWord] = useState<{segmentId: string, wordIndex: number, lang: 'de' | 'es'} | null>(null);
  const [flashSegmentId, setFlashSegmentId] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  const previousRevealedId = useRef<string | null>(null);
  const lastTapRef = useRef<number>(0);
  const getTextAlign = () => textAlignment === 'justify' ? 'justify' : 'left';

  // Efecto de flash permanente para el segmento buscado
  // (Se mantiene visible permanentemente para no perder la referencia)
  useEffect(() => {
    if (searchQuery && revealedSegmentId) {
      // Verificar si este párrafo contiene el segmento buscado
      const hasSegment = segments.some(s => s.id === revealedSegmentId);
      if (hasSegment) {
        setFlashSegmentId(revealedSegmentId);
      } else {
        setFlashSegmentId(null);
      }
    } else {
      setFlashSegmentId(null);
    }
  }, [searchQuery, revealedSegmentId, segments]);

  // Obtener el nombre de fuente cargada para React Native Text
  const getNativeFontFamily = () => {
    const fontOption = fontOptions.find(f => f.value === fontFamily);
    if (fontOption) {
      return fontOption.family.split(',')[0];
    }
    return 'System';
  };

  // Función para obtener los índices mapeados (todas las palabras del grupo)
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

  // Hooks deben llamarse ANTES de cualquier return condicional
  
  // Efecto para cambiar fuente dinámicamente sin recrear el WebView
  useEffect(() => {
    if (webViewRef.current && viewMode === 'immersive' && webFontCSS[fontFamily]) {
      const fontCSS = webFontCSS[fontFamily];
      const js = `
        (function() {
          // Remover fuentes anteriores
          var oldStyle = document.getElementById('dynamic-fonts');
          if (oldStyle) oldStyle.remove();
          
          // Agregar nuevas fuentes
          var style = document.createElement('style');
          style.id = 'dynamic-fonts';
          style.textContent = \`${fontCSS}\`;
          document.head.appendChild(style);
          
          // Aplicar fuente al body
          document.body.style.fontFamily = '${fontFamily}, Georgia, serif';
          
          // Esperar carga y recalcular altura
          function updateHeight() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'height', 
              height: document.body.scrollHeight
            }));
          }
          
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(updateHeight);
            setTimeout(updateHeight, 150);
          } else {
            setTimeout(updateHeight, 100);
          }
        })(); true;
      `;
      webViewRef.current.injectJavaScript(js);
    }
  }, [fontFamily, viewMode]);
  
  useEffect(() => {
    if (webViewRef.current && viewMode === 'immersive') {
      if (revealedSegmentId !== previousRevealedId.current) {
        previousRevealedId.current = revealedSegmentId;
        
        const js = translationStyle === 'tooltip' 
          ? `(function() { 
               document.querySelectorAll('.seg').forEach(s => s.classList.remove('revealed')); 
               document.getElementById('active-tooltip').classList.remove('visible'); 
               ${revealedSegmentId ? `
                 const el = document.getElementById('seg-${revealedSegmentId}');
                 if (el) {
                   el.classList.add('revealed');
                   const tooltip = document.getElementById('active-tooltip');
                   const tooltipText = tooltip.querySelector('.tooltip-text');
                   const rect = el.getBoundingClientRect();
                   const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                   tooltipText.textContent = translations['${revealedSegmentId}'];
                   tooltip.classList.add('visible');
                   const tooltipRect = tooltip.getBoundingClientRect();
                   const vw = window.innerWidth;
                   let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                   left = Math.max(8, Math.min(left, vw - tooltipRect.width - 8));
                   let top = rect.bottom + scrollTop + 8;
                   tooltip.style.left = left + 'px';
                   tooltip.style.top = top + 'px';
                 }
               ` : ''}
             })(); true;`
          : `document.querySelectorAll('.t').forEach(t => t.classList.remove('visible')); document.querySelectorAll('.s').forEach(s => s.classList.remove('revealed')); ${revealedSegmentId ? `document.getElementById('t-${revealedSegmentId}')?.classList.add('visible'); document.getElementById('s-${revealedSegmentId}')?.classList.add('revealed');` : ''} true`;
        
        webViewRef.current.injectJavaScript(js);
      }
    }
  }, [revealedSegmentId, viewMode, translationStyle]);

  // Modos no-inmersivos usan Text nativo
  if (viewMode !== 'immersive') {
    const germanParagraph = segments.map(s => s.german.join(' ')).join(' ');
    const spanishParagraph = segments.map(s => s.spanish.join(' ')).join(' ');

    const androidTextProps = Platform.OS === 'android' ? {
      textBreakStrategy: 'simple' as const,
      dataDetectorType: 'none' as const,
    } : {};

    const baseTextStyle = {
      fontFamily: getNativeFontFamily(),
      fontSize,
      lineHeight: fontSize * lineHeight,
      textAlign: isFirst ? 'center' : getTextAlign(),
    } as const;

    const handlePress = () => {
      const now = Date.now();
      if (lastTapRef.current && now - lastTapRef.current < 300) {
        onDoubleTap?.();
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    };

    const handleLayout = (event: LayoutChangeEvent) => {
      onLayout?.(paragraphIndex, event.nativeEvent.layout.y);
    };

    if (viewMode === 'german-only') {
      return (
        <Pressable onPress={handlePress} onLayout={handleLayout} style={[styles.paragraph, isFirst && styles.firstParagraph]}>
          <Text style={[styles.paragraphText, baseTextStyle, { color: theme.germanText }]} {...androidTextProps} selectable={true}>
            {germanParagraph}
          </Text>
        </Pressable>
      );
    }

    if (viewMode === 'spanish-only') {
      return (
        <Pressable onPress={handlePress} onLayout={handleLayout} style={[styles.paragraph, isFirst && styles.firstParagraph]}>
          <Text style={[styles.paragraphText, baseTextStyle, { color: theme.spanishText }]} {...androidTextProps} selectable={true}>
            {spanishParagraph}
          </Text>
        </Pressable>
      );
    }

    // Verifica si una posición dentro del texto completo está dentro de una coincidencia de búsqueda
    const getSearchHighlightStyle = (fullText: string, charIndex: number, wordLength: number) => {
      if (!searchQuery || searchQuery.trim().length === 0) return null;
      
      const lowerText = fullText.toLowerCase();
      const lowerQuery = searchQuery.toLowerCase().trim();
      let matchIndex = lowerText.indexOf(lowerQuery);
      
      while (matchIndex !== -1) {
        const matchEnd = matchIndex + searchQuery.length;
        // Si la palabra (o parte de ella) está dentro del match
        if (charIndex < matchEnd && charIndex + wordLength > matchIndex) {
          return {
            backgroundColor: theme.accent + '40',
            color: theme.accent,
            fontWeight: '700' as const,
            borderRadius: 2,
          };
        }
        matchIndex = lowerText.indexOf(lowerQuery, matchIndex + 1);
      }
      return null;
    };

    // Modo Paralelo: mostrar segmento por segmento (alemán + español)
    const handleWordTouch = (segment: TextSegment, wordIndex: number, lang: 'de' | 'es') => {
      if (segment.mapping && segment.mapping.length > 0) {
        // Si la misma palabra ya está subrayada, la quitamos (toggle)
        if (
          highlightedWord &&
          highlightedWord.segmentId === segment.id &&
          highlightedWord.wordIndex === wordIndex &&
          highlightedWord.lang === lang
        ) {
          setHighlightedWord(null);
        } else {
          // Si es una palabra diferente, reemplazamos el subrayado
          setHighlightedWord({ segmentId: segment.id, wordIndex, lang });
        }
      }
    };

    const isWordHighlighted = (segmentId: string, wordIndex: number, lang: 'de' | 'es'): boolean => {
      if (!highlightedWord || highlightedWord.segmentId !== segmentId) return false;

      if (highlightedWord.lang === lang) {
        return highlightedWord.wordIndex === wordIndex;
      } else {
        // Check if this word is in the mapped indices from the highlighted word
        const mappedIndices = getMappedIndices(
          segments.find(s => s.id === segmentId)?.mapping,
          highlightedWord.wordIndex,
          highlightedWord.lang
        );
        return mappedIndices.includes(wordIndex);
      }
    };

    return (
      <Pressable onPress={handlePress} onLayout={handleLayout} style={[styles.parallelContainer, isFirst && styles.firstParagraph]}>
        {segments.map((segment, index) => {
          const isParagraphStart = segment.isParagraphStart;
          const hasMapping = segment.mapping && segment.mapping.length > 0;

          const isFlashed = flashSegmentId === segment.id;

          return (
            <View
              key={segment.id}
              style={[
                styles.segmentPair,
                isParagraphStart && styles.paragraphStartSpacing,
                isFlashed && { 
                  backgroundColor: theme.accent + '20',
                  borderRadius: 4,
                  padding: 4,
                  marginHorizontal: -4,
                }
              ]}
            >
              {/* Texto alemán con palabras individuales tocables */}
              <Text style={[styles.germanSegmentText, baseTextStyle, { color: theme.germanText, textAlign: 'left' }]} {...androidTextProps} selectable={!hasMapping}>
                {segment.german.map((word, wordIdx) => {
                  const isHighlighted = isWordHighlighted(segment.id, wordIdx, 'de');
                  const hasWordMapping = hasMapping && hasMappingForWord(segment.mapping, wordIdx, 'de');
                  
                  // Calcular posición en el texto completo para resaltado de búsqueda
                  const charIndex = segment.german.slice(0, wordIdx).join(' ').length + (wordIdx > 0 ? 1 : 0);
                  const searchStyle = searchQuery ? getSearchHighlightStyle(segment.german.join(' '), charIndex, word.length) : null;

                  return (
                    <Text
                      key={`de-${wordIdx}`}
                      onPress={hasWordMapping ? () => handleWordTouch(segment, wordIdx, 'de') : undefined}
                      style={{
                        textDecorationLine: isHighlighted ? 'underline' : 'none',
                        textDecorationColor: theme.accent,
                        textDecorationStyle: 'solid',
                        color: isHighlighted ? theme.accent : (searchStyle ? searchStyle.color : theme.germanText),
                        backgroundColor: searchStyle ? searchStyle.backgroundColor : undefined,
                        fontWeight: searchStyle ? searchStyle.fontWeight : undefined,
                        borderRadius: searchStyle ? searchStyle.borderRadius : undefined,
                      }}
                    >
                      {word + ' '}
                    </Text>
                  );
                })}
              </Text>

              {/* Texto español con palabras individuales tocables */}
              <Text style={[styles.spanishSegmentText, baseTextStyle, { color: theme.spanishText, fontSize: fontSize * 0.80, textAlign: 'left', opacity: 0.7, fontWeight: '300' }]} {...androidTextProps} selectable={!hasMapping}>
                {segment.spanish.map((word, wordIdx) => {
                  const isHighlighted = isWordHighlighted(segment.id, wordIdx, 'es');
                  const hasWordMapping = hasMapping && hasMappingForWord(segment.mapping, wordIdx, 'es');
                  
                  // Calcular posición en el texto completo para resaltado de búsqueda
                  const charIndex = segment.spanish.slice(0, wordIdx).join(' ').length + (wordIdx > 0 ? 1 : 0);
                  const searchStyle = searchQuery ? getSearchHighlightStyle(segment.spanish.join(' '), charIndex, word.length) : null;

                  return (
                    <Text
                      key={`es-${wordIdx}`}
                      onPress={hasWordMapping ? () => handleWordTouch(segment, wordIdx, 'es') : undefined}
                      style={{
                        textDecorationLine: isHighlighted ? 'underline' : 'none',
                        textDecorationColor: theme.accent,
                        textDecorationStyle: 'solid',
                        color: isHighlighted ? theme.accent : (searchStyle ? searchStyle.color : theme.spanishText),
                        backgroundColor: searchStyle ? searchStyle.backgroundColor : undefined,
                        fontWeight: searchStyle ? searchStyle.fontWeight : undefined,
                        borderRadius: searchStyle ? searchStyle.borderRadius : undefined,
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
      </Pressable>
    );
  }

  // Generar HTML para modo inmersivo
  const generateHTML = () => {
    const textAlign = isFirst ? 'center' : getTextAlign();
    const isTooltip = translationStyle === 'tooltip';
    
    // Mapa de traducciones
    const translationsMap: Record<string, string> = {};
    segments.forEach(s => {
      translationsMap[s.id] = s.spanish.join(' ');
    });
    
    // Para WebView usamos fuentes del sistema (garantizado a funcionar)
    // Las fuentes locales via @font-face tienen problemas de acceso en WebView
    // Las fuentes se inyectan dinámicamente vía JS para evitar recargar el WebView
    const fontFamilyCSS = fontFamily;
    
    if (isTooltip) {
      // Tooltip mode
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
      font-family: '${fontFamilyCSS}', Georgia, serif;
      font-size: ${fontSize}px;
      line-height: ${lineHeight};
      color: ${theme.germanText};
      background: ${theme.background};
      margin: 0;
      padding: 0 4px;
      position: relative;
    }
    .paragraph {
      text-align: ${textAlign};
      padding: 0;
      margin: 0;
    }
    .seg {
      cursor: pointer;
      padding: 2px 0;
      border-radius: 3px;
      transition: background 0.15s;
    }
    .seg:active, .seg.revealed {
      background: ${theme.highlight};
    }
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
      pointer-events: none;
    }
    .tooltip.visible {
      opacity: 1;
      visibility: visible;
    }
    .tooltip-text {
      font-style: italic;
      color: ${theme.spanishText};
      font-size: ${fontSize * 0.92}px;
      line-height: 1.4;
    }
    .tooltip-arrow {
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid ${theme.border};
    }
    .search-highlight {
      background-color: ${theme.accent}40;
      color: ${theme.accent};
      font-weight: 600;
      border-radius: 2px;
      padding: 0 2px;
    }
  </style>
</head>
<body>
  <div class="paragraph">${segmentsHtml}</div>
  <div class="tooltip" id="active-tooltip">
    <span class="tooltip-text"></span>
    <div class="tooltip-arrow"></div>
  </div>
  <script>
    window.translations = ${JSON.stringify(translationsMap)};
    (function() {
      // Cargar fuente inicial
      var initialFont = document.createElement('style');
      initialFont.id = 'dynamic-fonts';
      initialFont.textContent = \`${webFontCSS[fontFamily] || ''}\`;
      document.head.appendChild(initialFont);
      document.body.style.fontFamily = '${fontFamily}, Georgia, serif';
      
      // Función para resaltar texto buscado
      function highlightSearchText(query) {
        if (!query || query.trim().length === 0) return;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
          if (node.parentElement && !node.parentElement.classList.contains('search-highlight')) {
            textNodes.push(node);
          }
        }
        const lowerQuery = query.toLowerCase();
        textNodes.forEach(function(textNode) {
          const text = textNode.textContent;
          const lowerText = text.toLowerCase();
          let index = lowerText.indexOf(lowerQuery);
          if (index !== -1) {
            const parent = textNode.parentNode;
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            while (index !== -1) {
              // Texto antes del match
              if (index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
              }
              // Match resaltado
              const highlight = document.createElement('span');
              highlight.className = 'search-highlight';
              highlight.textContent = text.slice(index, index + query.length);
              fragment.appendChild(highlight);
              
              lastIndex = index + query.length;
              index = lowerText.indexOf(lowerQuery, lastIndex);
            }
            // Texto restante
            if (lastIndex < text.length) {
              fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
            }
            parent.replaceChild(fragment, textNode);
          }
        });
      }
      
      // Resaltar si hay query
      ${searchQuery ? `highlightSearchText('${searchQuery.replace(/'/g, "\\'")}');` : ''}
      
      const translations = window.translations;
      const tooltip = document.getElementById('active-tooltip');
      const tooltipText = tooltip.querySelector('.tooltip-text');
      let currentId = null;
      let lastTap = 0, lastTapId = null;
      
      function showTooltip(el, id) {
        const rect = el.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        tooltipText.textContent = translations[id];
        tooltip.classList.add('visible');
        
        // Calcular posición después de hacer visible para obtener dimensiones
        const tooltipRect = tooltip.getBoundingClientRect();
        const vw = window.innerWidth;
        
        // Centrar horizontalmente respecto al elemento
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        // Asegurar que no se salga de la pantalla
        left = Math.max(8, Math.min(left, vw - tooltipRect.width - 8));
        
        // Posicionar arriba o abajo según espacio
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;
        let top;
        
        if (spaceAbove > tooltipRect.height + 10 && spaceAbove > spaceBelow) {
          // Mostrar arriba
          top = rect.top + scrollTop - tooltipRect.height - 8;
        } else {
          // Mostrar abajo
          top = rect.bottom + scrollTop + 8;
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
      }
      
      function hideTooltip() {
        tooltip.classList.remove('visible');
        document.querySelectorAll('.seg').forEach(s => s.classList.remove('revealed'));
        currentId = null;
      }
      
      document.querySelectorAll('.seg').forEach(el => {
        el.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const id = this.getAttribute('data-id');
          const now = Date.now();
          
          // Detectar doble-tap
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
      
      // Cerrar al tocar fuera
      document.addEventListener('click', function(e) {
        if (!e.target.classList.contains('seg')) {
          hideTooltip();
        }
      });
      
      // Esperar a que las fuentes se carguen antes de calcular la altura
      if (document.fonts) {
        document.fonts.ready.then(function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({type: 'height', height: document.body.scrollHeight}));
        });
      } else {
        setTimeout(function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({type: 'height', height: document.body.scrollHeight}));
        }, 100);
      }
    })();
  </script>
</body>
</html>`;
    } else {
      // Inline mode - TEXTO CONTINUO
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
      font-family: '${fontFamilyCSS}', Georgia, serif;
      font-size: ${fontSize}px;
      line-height: ${lineHeight};
      color: ${theme.germanText};
      background: ${theme.background};
      margin: 0;
      padding: 0 4px;
    }
    p {
      text-align: ${textAlign};
      margin: 0;
      padding: 5px 0;
    }
    .s {
      cursor: pointer;
      padding: 2px 0;
      border-radius: 3px;
      transition: background 0.15s;
    }
    .s:hover, .s.revealed {
      background: ${theme.highlight};
    }
    .t {
      display: none;
      font-style: italic;
      color: ${theme.spanishText};
      font-size: ${fontSize * 0.95}px;
      margin: 4px 0 8px 8px;
      padding: 4px 8px;
      border-left: 3px solid ${theme.accent};
    }
    .t.visible {
      display: inline-block;
    }
    .search-highlight {
      background-color: ${theme.accent}40;
      color: ${theme.accent};
      font-weight: 600;
      border-radius: 2px;
      padding: 0 2px;
    }
  </style>
</head>
<body>
  <p>${segmentsHtml}</p>
  <script>
    (function() {
      // Cargar fuente inicial
      var initialFont = document.createElement('style');
      initialFont.id = 'dynamic-fonts';
      initialFont.textContent = \`${webFontCSS[fontFamily] || ''}\`;
      document.head.appendChild(initialFont);
      document.body.style.fontFamily = '${fontFamily}, Georgia, serif';
      
      // Función para resaltar texto buscado
      function highlightSearchText(query) {
        if (!query || query.trim().length === 0) return;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
          if (node.parentElement && !node.parentElement.classList.contains('search-highlight')) {
            textNodes.push(node);
          }
        }
        const lowerQuery = query.toLowerCase();
        textNodes.forEach(function(textNode) {
          const text = textNode.textContent;
          const lowerText = text.toLowerCase();
          let index = lowerText.indexOf(lowerQuery);
          if (index !== -1) {
            const parent = textNode.parentNode;
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            while (index !== -1) {
              // Texto antes del match
              if (index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
              }
              // Match resaltado
              const highlight = document.createElement('span');
              highlight.className = 'search-highlight';
              highlight.textContent = text.slice(index, index + query.length);
              fragment.appendChild(highlight);
              
              lastIndex = index + query.length;
              index = lowerText.indexOf(lowerQuery, lastIndex);
            }
            // Texto restante
            if (lastIndex < text.length) {
              fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
            }
            parent.replaceChild(fragment, textNode);
          }
        });
      }
      
      // Resaltar si hay query
      ${searchQuery ? `highlightSearchText('${searchQuery.replace(/'/g, "\\'")}');` : ''}
      
      let lastTap = 0, lastTapId = null, currentId = null;
      
      document.querySelectorAll('.s').forEach(el => {
        el.addEventListener('click', function(e) {
          e.preventDefault();
          const id = this.getAttribute('data-id');
          const now = Date.now();
          
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
          lastTap = now; lastTapId = id;
          
          setTimeout(() => {
            window.ReactNativeWebView.postMessage(JSON.stringify({type: 'height', height: document.body.scrollHeight}));
          }, 250);
        });
      });
      
      // Calcular altura después de que las fuentes carguen
      function sendHeight() {
        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'height', height: document.body.scrollHeight}));
      }
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(sendHeight);
        setTimeout(sendHeight, 100); // Fallback
      } else {
        setTimeout(sendHeight, 50);
      }
    })();
  </script>
</body>
</html>`;
    }
  };

  const html = generateHTML();

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
    } catch {
      // Ignorar
    }
  };

  const handleImmersiveLayout = (event: LayoutChangeEvent) => {
    onLayout?.(paragraphIndex, event.nativeEvent.layout.y);
  };

  return (
    <View style={[styles.paragraph, isFirst && styles.firstParagraph]} onLayout={handleImmersiveLayout}>
      <WebView
        ref={webViewRef}
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
  paragraph: {
    marginBottom: 12,
    width: '100%',
  },
  firstParagraph: {
    marginTop: 20,
  },
  chapterTitle: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  chapterTitleText: {
    textAlign: 'center',
  },
  paragraphText: {
    width: '100%',
  },
  germanParagraphText: {
    marginBottom: 8,
    width: '100%',
  },
  spanishParagraphText: {
    fontStyle: 'italic',
    width: '100%',
  },
  segmentContainer: {
    marginBottom: 12,
    width: '100%',
  },
  germanSegmentText: {
    marginBottom: 0,
    width: '100%',
  },
  spanishSegmentText: {
    width: '100%',
    marginTop: -6,
  },
  parallelContainer: {
    width: '100%',
  },
  segmentPair: {
    marginBottom: -2,
    width: '100%',
  },
  paragraphStartSpacing: {
    marginTop: 16,
  },
});
