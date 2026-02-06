import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../src/constants/theme';
import { ReadingProgress } from '../src/types';

interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  language: string;
  description: string;
  chapters: number;
  totalSegments: number;
}

const books: Book[] = [
  {
    id: 'tod-in-venedig',
    title: 'Der Tod in Venedig',
    author: 'Thomas Mann',
    year: 1912,
    language: 'Deutsch',
    description: 'Ein Klassiker der deutschen Literatur über den Schriftsteller Gustav von Aschenbach und seine Reise nach Venedig.',
    chapters: 5,
    totalSegments: 200, // Aproximado para el capítulo 1
  },
];

const PROGRESS_KEY = '@bivium_progress';

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();
  const [progressMap, setProgressMap] = useState<Record<string, ReadingProgress>>({});

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(PROGRESS_KEY);
      if (stored) {
        const allProgress: Record<string, ReadingProgress> = JSON.parse(stored);
        setProgressMap(allProgress);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleOpenBook = (bookId: string) => {
    router.push('/reader');
  };

  const formatLastRead = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('de-DE', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={[styles.title, { color: theme.text }]}>Bibliothek</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Bilinguale Klassiker
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {books.map((book) => {
          const progress = progressMap[book.id];
          const progressPercent = progress 
            ? Math.min(100, Math.round((progress.segmentIndex / book.totalSegments) * 100))
            : 0;
          
          return (
            <TouchableOpacity
              key={book.id}
              style={[styles.bookCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}
              onPress={() => handleOpenBook(book.id)}
              activeOpacity={0.9}
            >
              <View style={styles.bookContent}>
                <View style={styles.bookHeader}>
                  <View style={[styles.languageBadge, { backgroundColor: theme.accentLight }]}>
                    <Text style={[styles.languageText, { color: theme.surface }]}>
                      {book.language}
                    </Text>
                  </View>
                  <Text style={[styles.year, { color: theme.textMuted }]}>
                    {book.year}
                  </Text>
                </View>

                <Text style={[styles.bookTitle, { color: theme.text }]}>
                  {book.title}
                </Text>
                <Text style={[styles.bookAuthor, { color: theme.textSecondary }]}>
                  {book.author}
                </Text>

                <Text style={[styles.bookDescription, { color: theme.textSecondary }]}>
                  {book.description}
                </Text>

                {/* Progress Bar */}
                {progress && progressPercent > 0 && (
                  <View style={styles.progressSection}>
                    <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                      <View
                        style={[
                          styles.progressFill,
                          { backgroundColor: theme.accent, width: `${progressPercent}%` },
                        ]}
                      />
                    </View>
                    <View style={styles.progressInfo}>
                      <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                        {progressPercent}% gelesen
                      </Text>
                      <Text style={[styles.lastReadText, { color: theme.textMuted }]}>
                        {formatLastRead(progress.lastReadAt)}
                      </Text>
                    </View>
                  </View>
                )}

                <View style={styles.bookFooter}>
                  <View style={styles.stat}>
                    <Ionicons name="book-outline" size={16} color={theme.textMuted} />
                    <Text style={[styles.statText, { color: theme.textMuted }]}>
                      {book.chapters} Kapitel
                    </Text>
                  </View>
                  <View style={[styles.readButton, { backgroundColor: theme.accent }]}>
                    <Text style={styles.readButtonText}>
                      {progress && progressPercent > 0 ? 'Weiterlesen' : 'Lesen'}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={[styles.comingSoon, { borderColor: theme.border }]}>
          <Ionicons name="time-outline" size={32} color={theme.textMuted} />
          <Text style={[styles.comingSoonText, { color: theme.textMuted }]}>
            Weitere Werke folgen
          </Text>
          <Text style={[styles.comingSoonSubtext, { color: theme.textMuted }]}>
            Wir bereiten neue Klassiker für Sie vor
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  bookCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  bookContent: {
    padding: 20,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  year: {
    fontSize: 14,
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 15,
    marginBottom: 12,
  },
  bookDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
  },
  lastReadText: {
    fontSize: 12,
  },
  bookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  readButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  comingSoon: {
    alignItems: 'center',
    paddingVertical: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 8,
  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  comingSoonSubtext: {
    fontSize: 13,
    marginTop: 4,
  },
});
