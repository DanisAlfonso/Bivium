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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../src/constants/theme';
import { loadBook } from '../src/lib/bookLoader';
import { Book, ReadingProgress } from '../src/types';

const PROGRESS_KEY = '@bivium_progress';

export default function ChaptersScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();
  
  const [book, setBook] = useState<Book | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, ReadingProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [bookId]);

  const loadData = async () => {
    try {
      const [bookData, stored] = await Promise.all([
        loadBook(bookId),
        AsyncStorage.getItem(PROGRESS_KEY)
      ]);
      
      setBook(bookData);
      
      if (stored) {
        const allProgress: Record<string, ReadingProgress> = JSON.parse(stored);
        setProgressMap(allProgress);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChapter = (chapterId: string) => {
    router.push({
      pathname: '/reader',
      params: { bookId, chapterId }
    });
  };

  const handleBack = () => {
    router.back();
  };

  const getChapterProgress = (chapterId: string) => {
    const progress = progressMap[chapterId];
    return progress || null;
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

  const getChapterTitle = (chapterId: string, index: number) => {
    // For now, use simple numbering. In the future, could load chapter metadata
    const chapterNum = index + 1;
    if (chapterNum === 1) return 'Erstes Kapitel';
    if (chapterNum === 2) return 'Zweites Kapitel';
    if (chapterNum === 3) return 'Drittes Kapitel';
    if (chapterNum === 4) return 'Viertes Kapitel';
    if (chapterNum === 5) return 'Fünftes Kapitel';
    return `Kapitel ${chapterNum}`;
  };

  const getChapterTitleEs = (chapterId: string, index: number) => {
    const chapterNum = index + 1;
    if (chapterNum === 1) return 'Capítulo Primero';
    if (chapterNum === 2) return 'Capítulo Segundo';
    if (chapterNum === 3) return 'Capítulo Tercero';
    if (chapterNum === 4) return 'Capítulo Cuarto';
    if (chapterNum === 5) return 'Capítulo Quinto';
    return `Capítulo ${chapterNum}`;
  };

  if (loading || !book) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Kapitel</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.textSecondary }}>Laden...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {book.title.de}
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>Kapitel</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {book.chapters.map((chapterId, index) => {
          const progress = getChapterProgress(chapterId);
          const hasProgress = progress && progress.segmentIndex > 0;
          
          return (
            <TouchableOpacity
              key={chapterId}
              style={[
                styles.chapterCard,
                { 
                  backgroundColor: theme.surface,
                  borderColor: hasProgress ? theme.accent : theme.border
                }
              ]}
              onPress={() => handleSelectChapter(chapterId)}
              activeOpacity={0.9}
            >
              <View style={styles.chapterNumber}>
                <Text style={[styles.numberText, { color: theme.accent }]}>
                  {index + 1}
                </Text>
              </View>
              
              <View style={styles.chapterInfo}>
                <Text style={[styles.chapterTitle, { color: theme.text }]}>
                  {getChapterTitle(chapterId, index)}
                </Text>
                <Text style={[styles.chapterTitleEs, { color: theme.textSecondary }]}>
                  {getChapterTitleEs(chapterId, index)}
                </Text>
                
                {progress && (
                  <View style={styles.progressInfo}>
                    <Text style={[styles.progressText, { color: theme.textMuted }]}>
                      Segment {progress.segmentIndex}
                    </Text>
                    <Text style={[styles.lastReadText, { color: theme.textMuted }]}>
                      {formatLastRead(progress.lastReadAt)}
                    </Text>
                  </View>
                )}
              </View>
              
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme.textMuted} 
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 12,
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  chapterNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  numberText: {
    fontSize: 18,
    fontWeight: '700',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  chapterTitleEs: {
    fontSize: 14,
    marginBottom: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 13,
  },
  lastReadText: {
    fontSize: 12,
  },
});
