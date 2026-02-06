import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chapter, TextSegment } from '../types';
import { lightTheme, darkTheme } from '../constants/theme';
import { fontOptions } from '../constants/fonts';
import { useSettings } from '../hooks/useSettings';
import { useProgress } from '../hooks/useProgress';
import { ReaderHeader } from './ReaderHeader';
import { SettingsPanel } from './SettingsPanel';
import { Paragraph } from './Paragraph';

interface BilingualReaderProps {
  chapter: Chapter;
  onBack: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 110;

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

export function BilingualReader({ chapter, onBack }: BilingualReaderProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  
  const [headerVisible, setHeaderVisible] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Solo UN segmento revelado a la vez (modo single simplificado)
  const [revealedSegmentId, setRevealedSegmentId] = useState<string | null>(null);
  
  const {
    settings,
    isLoading: settingsLoading,
    setFontFamily,
    setFontSize,
    setLineHeight,
    setViewMode,
    setTextAlignment,
    setTranslationStyle,
  } = useSettings();
  
  const { progress, saveProgress } = useProgress(chapter.id);

  const isImmersiveMode = settings.viewMode === 'immersive';

  const paragraphs = useMemo(() => {
    return groupSegmentsIntoParagraphs(chapter.segments);
  }, [chapter.segments]);

  const animateHeader = useCallback((show: boolean) => {
    setHeaderVisible(show);
    if (show) {
      setShowHint(false);
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    }
    Animated.timing(headerTranslateY, {
      toValue: show ? 0 : -HEADER_HEIGHT - 20,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [headerTranslateY]);

  const scheduleHide = useCallback(() => {
    if (!isImmersiveMode) return;
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      animateHeader(false);
      setShowHint(true);
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
      hintTimeoutRef.current = setTimeout(() => {
        setShowHint(false);
      }, 4000);
    }, 2500);
  }, [isImmersiveMode, animateHeader]);

  const toggleHeader = useCallback(() => {
    if (!isImmersiveMode) return;
    
    if (headerVisible) {
      animateHeader(false);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    } else {
      animateHeader(true);
      scheduleHide();
    }
  }, [isImmersiveMode, headerVisible, animateHeader, scheduleHide]);

  useEffect(() => {
    if (isImmersiveMode) {
      animateHeader(true);
      scheduleHide();
    } else {
      animateHeader(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    }
    
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    };
  }, [isImmersiveMode, animateHeader, scheduleHide]);

  // Reset flag al montar el componente
  useEffect(() => {
    setHasRestoredProgress(false);
  }, []);

  // Restore progress cuando esté disponible
  useEffect(() => {
    if (hasRestoredProgress || settingsLoading) return;
    
    if (progress && progress.segmentIndex > 0) {
      const estimatedY = progress.segmentIndex * 60;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: estimatedY, animated: false });
        setHasRestoredProgress(true);
      }, 300);
    } else {
      setHasRestoredProgress(true);
    }
  }, [progress, settingsLoading]);

  // Guardar progreso periódicamente cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSegment = Math.floor(scrollY / 50);
      if (currentSegment > 0) {
        saveProgress(currentSegment);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [scrollY, saveProgress]);

  const handleScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollY(offsetY);
    
    const estimatedSegment = Math.floor(offsetY / 50);
    if (estimatedSegment >= 0 && estimatedSegment < chapter.segments.length) {
      // Guardar cada 5 segmentos para más precisión
      if (estimatedSegment % 5 === 0) {
        saveProgress(estimatedSegment);
      }
    }
  }, [chapter.segments.length, saveProgress]);

  // Guardar progreso al desmontar el componente (cuando el usuario sale)
  useEffect(() => {
    return () => {
      const finalSegment = Math.floor(scrollY / 50);
      if (finalSegment > 0) {
        saveProgress(finalSegment);
      }
    };
  }, [scrollY, saveProgress]);

  const toggleSegmentReveal = useCallback((segmentId: string) => {
    setRevealedSegmentId(prev => {
      // Si toco el mismo que ya está revelado, lo cierro
      if (prev === segmentId) {
        return null;
      }
      // Si toco uno diferente, cierro el anterior y abro el nuevo
      return segmentId;
    });
  }, []);

  const totalSegments = chapter.segments.length;
  const currentSegment = Math.floor(scrollY / 50);
  const progressPercent = Math.min(100, Math.round((currentSegment / totalSegments) * 100));

  const currentFont = fontOptions.find(f => f.value === settings.fontFamily);
  const fontFamily = currentFont?.family.split(',')[0] || 'System';
  const fontFamilyId = currentFont?.value || 'merriweather'; // ID para WebView

  const headerTranslateYValue = headerTranslateY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -HEADER_HEIGHT],
  });

  if (settingsLoading) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View 
        style={[
          styles.headerContainer,
          { transform: [{ translateY: headerTranslateYValue }] }
        ]}
        pointerEvents={headerVisible ? 'auto' : 'none'}
      >
        <ReaderHeader
          chapter={chapter}
          onBack={onBack}
          onOpenSettings={() => setSettingsVisible(true)}
          progress={progressPercent}
        />
      </Animated.View>

      {isImmersiveMode && !headerVisible && showHint && (
        <View style={[styles.hintContainer, { backgroundColor: theme.surface + 'CC' }]}>
          <Text style={[styles.hintText, { color: theme.textSecondary }]}>
            Doble tap para controles
          </Text>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={1000}
        contentContainerStyle={[
          styles.contentContainer,
          { 
            paddingTop: isImmersiveMode ? 20 : HEADER_HEIGHT + 20,
            paddingBottom: insets.bottom + 40 
          },
        ]}
        showsVerticalScrollIndicator={true}
      >
        {paragraphs.map((paragraphSegments, index) => (
          <Paragraph
            key={`para-${index}`}
            segments={paragraphSegments}
            viewMode={settings.viewMode}
            textAlignment={settings.textAlignment}
            translationStyle={settings.translationStyle}
            revealedSegmentId={revealedSegmentId}
            onToggleReveal={toggleSegmentReveal}
            onDoubleTap={isImmersiveMode ? toggleHeader : undefined}
            theme={theme}
            fontFamily={fontFamilyId}
            fontSize={settings.fontSize}
            lineHeight={settings.lineHeight}
            isFirst={index === 0}
          />
        ))}
      </ScrollView>

      <SettingsPanel
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        fontFamily={settings.fontFamily}
        fontSize={settings.fontSize}
        lineHeight={settings.lineHeight}
        viewMode={settings.viewMode}
        textAlignment={settings.textAlignment}
        translationStyle={settings.translationStyle}
        onFontFamilyChange={setFontFamily}
        onFontSizeChange={setFontSize}
        onLineHeightChange={setLineHeight}
        onViewModeChange={setViewMode}
        onTextAlignmentChange={setTextAlignment}
        onTranslationStyleChange={setTranslationStyle}
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
  contentContainer: {
    paddingHorizontal: 20,
  },
});
