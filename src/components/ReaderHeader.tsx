import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chapter } from '../types';
import { lightTheme, darkTheme } from '../constants/theme';

interface ReaderHeaderProps {
  chapter: Chapter;
  onBack: () => void;
  onOpenSettings: () => void;
  progress: number;
}

export function ReaderHeader({ chapter, onBack, onOpenSettings, progress }: ReaderHeaderProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      {/* Safe area spacer */}
      <View style={styles.safeAreaSpacer} />
      
      {/* Contenido principal */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={onBack} style={styles.button}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={[styles.bookTitle, { color: theme.text }]} numberOfLines={1}>
              {chapter.bookTitle.de}
            </Text>
            <Text style={[styles.chapterTitle, { color: theme.textSecondary }]} numberOfLines={1}>
              {chapter.title.de}
            </Text>
          </View>

          <TouchableOpacity onPress={onOpenSettings} style={styles.button}>
            <Ionicons name="settings-outline" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.accent, width: `${progress}%` },
              ]}
            />
          </View>
        </View>
      </View>
      
      {/* Borde inferior */}
      <View style={[styles.borderBottom, { backgroundColor: theme.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  safeAreaSpacer: {
    height: 50, // Espacio para status bar
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  button: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  chapterTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  progressBar: {
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  borderBottom: {
    height: 1,
    width: '100%',
  },
});
