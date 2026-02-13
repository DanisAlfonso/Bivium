import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../src/constants/theme';
import { loadBook } from '../src/lib/bookLoader';
import { Book, ReadingProgress } from '../src/types';
import { useI18n } from '../src/i18n';

const PROGRESS_KEY = '@bivium_progress';

export default function ChaptersScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();
  const { t, language } = useI18n();
  
  const [book, setBook] = useState<Book | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, ReadingProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [bookId]);

  useFocusEffect(
    useCallback(() => {
      loadProgressOnly();
    }, [])
  );

  const loadProgressOnly = async () => {
    try {
      const stored = await AsyncStorage.getItem(PROGRESS_KEY);
      if (stored) {
        const allProgress: Record<string, ReadingProgress> = JSON.parse(stored);
        setProgressMap(allProgress);
      }
    } catch (error) {
      // Silently handle error
    }
  };

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
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  const getShortChapterId = (chapterId: string) => {
    const match = chapterId.match(/chapter-(\d+)/);
    if (match) {
      return `ch${match[1]}`;
    }
    return chapterId;
  };

  const handleSelectChapter = (chapterId: string) => {
    const shortId = getShortChapterId(chapterId);
    const progressKey = `${bookId}-${shortId}`;
    const progress = progressMap[progressKey];
    
    const params: any = { bookId, chapterId };
    if (progress && progress.segmentIndex > 0) {
      params.segmentIndex = progress.segmentIndex.toString();
    }
    
    router.push({
      pathname: '/reader',
      params
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handleSearch = () => {
    router.push({
      pathname: '/search',
      params: { bookId }
    });
  };

  const getChapterProgress = (chapterId: string) => {
    const shortId = getShortChapterId(chapterId);
    const progressKey = `${bookId}-${shortId}`;
    const progress = progressMap[progressKey];
    return progress || null;
  };

  const formatLastRead = (timestamp: number) => {
    const date = new Date(timestamp);
    const localeMap: Record<string, string> = {
      'es': 'es-ES',
      'de': 'de-DE',
      'en': 'en-US',
    };
    return date.toLocaleDateString(localeMap[language] || 'es-ES', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChapterTitle = (index: number) => {
    const chapterNum = index + 1;
    const chapterNames = t('chapters.chapterNames', {});
    if (typeof chapterNames === 'object' && chapterNames[chapterNum]) {
      return chapterNames[chapterNum];
    }
    return t('chapters.chapterNames.default', { number: chapterNum });
  };

  const getChapterTitleEs = (index: number) => {
    const chapterNum = index + 1;
    const spanishTitles: Record<number, string> = {
      1: 'Capítulo Primero',
      2: 'Capítulo Segundo',
      3: 'Capítulo Tercero',
      4: 'Capítulo Cuarto',
      5: 'Capítulo Quinto',
    };
    return spanishTitles[chapterNum] || `Capítulo ${chapterNum}`;
  };

  if (loading || !book) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>{t('chapters.title')}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.textSecondary }}>{t('chapters.loading')}</Text>
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
          <Text style={[styles.title, { color: theme.text }]}>{t('chapters.title')}</Text>
        </View>
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Ionicons name="search" size={22} color={theme.text} />
        </TouchableOpacity>
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
                  {getChapterTitle(index)}
                </Text>
                <Text style={[styles.chapterTitleEs, { color: theme.textSecondary }]}>
                  {getChapterTitleEs(index)}
                </Text>
                
                {progress && (
                  <View style={styles.progressInfo}>
                    <Text style={[styles.progressText, { color: theme.textMuted }]}>
                      {t('chapters.segment')} {progress.segmentIndex}
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
  searchButton: {
    padding: 8,
    marginRight: -8,
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
