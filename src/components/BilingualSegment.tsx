import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, { 
  FadeInUp,
  FadeOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { TextSegment, ViewMode, TextAlignment } from '../types';
import { Theme } from '../constants/theme';

interface BilingualSegmentProps {
  segment: TextSegment;
  viewMode: ViewMode;
  textAlignment: TextAlignment;
  immersiveMode: 'single' | 'all';
  isRevealed: boolean;
  onToggleReveal: () => void;
  theme: Theme;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
}

export function BilingualSegment({
  segment,
  viewMode,
  textAlignment,
  immersiveMode,
  isRevealed,
  onToggleReveal,
  theme,
  fontFamily,
  fontSize,
  lineHeight,
}: BilingualSegmentProps) {
  const germanText = segment.german.join(' ');
  const spanishText = segment.spanish.join(' ');

  const getTextAlign = (): 'left' | 'justify' => {
    return textAlignment === 'justify' ? 'justify' : 'left';
  };

  // Para Android, necesitamos props adicionales para que justify funcione
  const getAndroidTextProps = (): { textBreakStrategy?: 'simple' | 'highQuality' | 'balanced'; dataDetectorType?: 'none' } => {
    if (Platform.OS === 'android') {
      return {
        textBreakStrategy: 'simple',
        dataDetectorType: 'none',
      };
    }
    return {};
  };

  // Modo inmersivo: tap para revelar
  if (viewMode === 'immersive') {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggleReveal();
        }}
        style={[
          styles.immersiveContainer,
          segment.isParagraphStart && styles.paragraphStart,
        ]}
      >
        <Text
          style={[
            styles.immersiveGermanText,
            {
              color: theme.germanText,
              fontFamily,
              fontSize,
              lineHeight: fontSize * lineHeight,
              textAlign: getTextAlign(),
            },
            textAlignment === 'justify' && styles.justifiedText,
          ]}
          {...getAndroidTextProps()}
        >
          {germanText}
        </Text>

        {isRevealed && (
          <Animated.View
            entering={FadeInUp.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.translationContainer}
          >
            <View style={[styles.translationIndicator, { backgroundColor: theme.accent }]} />
            <Text
              style={[
                styles.immersiveSpanishText,
                {
                  color: theme.spanishText,
                  fontFamily,
                  fontSize: fontSize * 0.95,
                  lineHeight: fontSize * lineHeight * 0.95,
                  textAlign: getTextAlign(),
                },
                textAlignment === 'justify' && styles.justifiedText,
              ]}
              {...getAndroidTextProps()}
            >
              {spanishText}
            </Text>
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  }

  if (viewMode === 'german-only') {
    return (
      <View style={[
        styles.container,
        segment.isParagraphStart && styles.paragraphStart,
      ]}>
        <Text
          style={[
            styles.text,
            {
              color: theme.germanText,
              fontFamily,
              fontSize,
              lineHeight: fontSize * lineHeight,
              textAlign: getTextAlign(),
            },
            textAlignment === 'justify' && styles.justifiedText,
          ]}
          {...getAndroidTextProps()}
        >
          {germanText}
        </Text>
      </View>
    );
  }

  if (viewMode === 'spanish-only') {
    return (
      <View style={[
        styles.container,
        segment.isParagraphStart && styles.paragraphStart,
      ]}>
        <Text
          style={[
            styles.text,
            {
              color: theme.spanishText,
              fontFamily,
              fontSize,
              lineHeight: fontSize * lineHeight,
              textAlign: getTextAlign(),
            },
            textAlignment === 'justify' && styles.justifiedText,
          ]}
          {...getAndroidTextProps()}
        >
          {spanishText}
        </Text>
      </View>
    );
  }

  // Parallel mode
  return (
    <View style={[
      styles.parallelContainer,
      segment.isParagraphStart && styles.paragraphStart,
    ]}>
      <Text
        style={[
          styles.germanText,
          {
            color: theme.germanText,
            fontFamily,
            fontSize,
            lineHeight: fontSize * lineHeight,
            textAlign: getTextAlign(),
          },
          textAlignment === 'justify' && styles.justifiedText,
        ]}
        {...getAndroidTextProps()}
      >
        {germanText}
      </Text>
      <Text
        style={[
          styles.spanishText,
          {
            color: theme.spanishText,
            fontFamily,
            fontSize: fontSize * 0.92,
            lineHeight: fontSize * lineHeight,
            textAlign: getTextAlign(),
          },
          textAlignment === 'justify' && styles.justifiedText,
        ]}
        {...getAndroidTextProps()}
      >
        {spanishText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  parallelContainer: {
    marginBottom: 12,
  },
  paragraphStart: {
    marginTop: 20,
  },
  text: {
    // Base text styles
  },
  germanText: {
    marginBottom: 2,
  },
  spanishText: {
    fontStyle: 'italic',
  },
  justifiedText: {
    // En iOS, justify funciona bien por defecto
    // En Android, necesitamos asegurar que el texto tenga suficiente espacio
    flexWrap: 'wrap',
    width: '100%',
  },
  // Immersive mode styles
  immersiveContainer: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  immersiveGermanText: {
    // Base text styles
  },
  translationContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  translationIndicator: {
    width: 3,
    borderRadius: 1.5,
    marginRight: 10,
    marginTop: 4,
    alignSelf: 'stretch',
    minHeight: 20,
  },
  immersiveSpanishText: {
    flex: 1,
    fontStyle: 'italic',
    opacity: 0.9,
  },
});
