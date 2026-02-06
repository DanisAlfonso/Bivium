import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { TextSegment, ViewMode, TextAlignment, TranslationStyle } from '../types';
import { Theme } from '../constants/theme';

interface ParagraphProps {
  segments: TextSegment[];
  viewMode: ViewMode;
  textAlignment: TextAlignment;
  translationStyle: TranslationStyle;
  revealedSegmentId: string | null;
  onToggleReveal: (segmentId: string) => void;
  onDoubleTap?: () => void;
  theme: Theme;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  isFirst: boolean;
}

export function Paragraph({
  segments,
  viewMode,
  textAlignment,
  translationStyle,
  revealedSegmentId,
  onToggleReveal,
  onDoubleTap,
  theme,
  fontFamily,
  fontSize,
  lineHeight,
  isFirst,
}: ParagraphProps) {
  const [webViewHeight, setWebViewHeight] = useState(100);
  const webViewRef = useRef<WebView>(null);
  const previousRevealedId = useRef<string | null>(null);
  const getTextAlign = () => textAlignment === 'justify' ? 'justify' : 'left';

  // Hooks deben llamarse ANTES de cualquier return condicional
  useEffect(() => {
    if (webViewRef.current && viewMode === 'immersive') {
      if (revealedSegmentId !== previousRevealedId.current) {
        previousRevealedId.current = revealedSegmentId;
        
        const js = translationStyle === 'tooltip' 
          ? `document.querySelectorAll('.seg').forEach(s => s.classList.remove('revealed')); document.getElementById('active-tooltip').classList.remove('visible'); ${revealedSegmentId ? `document.getElementById('seg-${revealedSegmentId}')?.classList.add('revealed');` : ''} true;`
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
      fontFamily,
      fontSize,
      lineHeight: fontSize * lineHeight,
      textAlign: getTextAlign(),
    } as const;

    if (viewMode === 'german-only') {
      return (
        <View style={[styles.paragraph, isFirst && styles.firstParagraph]}>
          <Text style={[styles.paragraphText, baseTextStyle, { color: theme.germanText }]} {...androidTextProps}>
            {germanParagraph}
          </Text>
        </View>
      );
    }

    if (viewMode === 'spanish-only') {
      return (
        <View style={[styles.paragraph, isFirst && styles.firstParagraph]}>
          <Text style={[styles.paragraphText, baseTextStyle, { color: theme.spanishText }]} {...androidTextProps}>
            {spanishParagraph}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.paragraph, isFirst && styles.firstParagraph]}>
        <Text style={[styles.germanParagraphText, baseTextStyle, { color: theme.germanText }]} {...androidTextProps}>
          {germanParagraph}
        </Text>
        <Text style={[styles.spanishParagraphText, baseTextStyle, { color: theme.spanishText, fontSize: fontSize * 0.92 }]} {...androidTextProps}>
          {spanishParagraph}
        </Text>
      </View>
    );
  }

  // Generar HTML para modo inmersivo
  const generateHTML = () => {
    const textAlign = getTextAlign();
    const isTooltip = translationStyle === 'tooltip';
    
    // Mapa de traducciones
    const translationsMap: Record<string, string> = {};
    segments.forEach(s => {
      translationsMap[s.id] = s.spanish.join(' ');
    });
    
    if (isTooltip) {
      // Tooltip mode
      const segmentsHtml = segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const space = !isLast ? ' ' : '';
        const text = segment.german.join(' ');
        const position = isFirst && index < 3 ? 'start' : 'normal';
        return `<span class="seg" id="seg-${segment.id}" data-id="${segment.id}" data-pos="${position}">${text}${space}</span>`;
      }).join('');
      
      return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: '${fontFamily}', Georgia, serif;
      font-size: ${fontSize}px;
      line-height: ${lineHeight};
      color: ${theme.germanText};
      background: ${theme.background};
      margin: 0;
      padding: 0 4px;
    }
    .paragraph {
      text-align: ${textAlign};
      padding: 5px 0;
    }
    .seg {
      cursor: pointer;
      padding: 2px 0;
      border-radius: 3px;
      transition: background 0.15s;
    }
    .seg:hover, .seg.revealed {
      background: ${theme.highlight};
    }
    .tooltip {
      position: fixed;
      background: ${theme.surface};
      border: 1px solid ${theme.border};
      border-radius: 10px;
      padding: 12px 16px;
      box-shadow: 0 6px 24px rgba(0,0,0,0.3);
      z-index: 100000;
      min-width: 140px;
      max-width: 260px;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s;
    }
    .tooltip.visible {
      opacity: 1;
      visibility: visible;
    }
    .tooltip-text {
      font-style: italic;
      color: ${theme.spanishText};
      font-size: ${fontSize * 0.95}px;
    }
  </style>
</head>
<body>
  <div class="paragraph">${segmentsHtml}</div>
  <div class="tooltip" id="active-tooltip"><span class="tooltip-text"></span></div>
  <script>
    (function() {
      const translations = ${JSON.stringify(translationsMap)};
      const tooltip = document.getElementById('active-tooltip');
      const tooltipText = tooltip.querySelector('.tooltip-text');
      let lastTap = 0, lastTapId = null, currentId = null;
      
      function positionTooltip(el) {
        const rect = el.getBoundingClientRect();
        const vw = window.innerWidth;
        let left = rect.left + rect.width/2 - 130;
        if (left < 10) left = 10;
        if (left + 260 > vw - 10) left = vw - 270;
        let top = (el.getAttribute('data-pos') === 'start' || rect.top < 100) 
          ? rect.bottom + 12 
          : rect.top - 80;
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
      }
      
      document.querySelectorAll('.seg').forEach(el => {
        el.addEventListener('click', function(e) {
          e.preventDefault();
          const id = this.getAttribute('data-id');
          const now = Date.now();
          
          if (now - lastTap < 300 && lastTapId === id) {
            window.ReactNativeWebView.postMessage(JSON.stringify({type: 'doubleTap'}));
          } else {
            if (currentId === id) {
              tooltip.classList.remove('visible');
              this.classList.remove('revealed');
              currentId = null;
            } else {
              document.querySelectorAll('.seg').forEach(s => s.classList.remove('revealed'));
              tooltipText.textContent = translations[id];
              positionTooltip(this);
              tooltip.classList.add('visible');
              this.classList.add('revealed');
              currentId = id;
            }
            window.ReactNativeWebView.postMessage(JSON.stringify({type: 'segmentTap', segmentId: id}));
          }
          lastTap = now; lastTapId = id;
        });
      });
      
      setTimeout(() => {
        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'height', height: document.body.scrollHeight}));
      }, 100);
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
      font-family: '${fontFamily}', Georgia, serif;
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
  </style>
</head>
<body>
  <p>${segmentsHtml}</p>
  <script>
    (function() {
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
      
      setTimeout(() => {
        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'height', height: document.body.scrollHeight}));
      }, 100);
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
        setWebViewHeight(Math.max(50, data.height + 20));
      } else if (data.type === 'doubleTap' && onDoubleTap) {
        onDoubleTap();
      }
    } catch (e) {
      // Ignorar
    }
  };

  return (
    <View style={[styles.paragraph, isFirst && styles.firstParagraph]}>
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
    marginBottom: 20,
    width: '100%',
  },
  firstParagraph: {},
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
});
