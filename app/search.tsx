import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme, darkTheme } from '../src/constants/theme';
import { searchInBook, SearchResult, highlightMatches } from '../src/lib/search';
import { loadBook } from '../src/lib/bookLoader';
import { Book } from '../src/types';

export default function SearchScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    if (bookId) {
      loadBook(bookId).then(setBook);
    }
  }, [bookId]);

  const performSearch = useCallback(async () => {
    if (!query.trim() || !bookId) return;

    Keyboard.dismiss();
    setIsSearching(true);
    setHasSearched(true);

    try {
      const searchResults = await searchInBook(bookId, query.trim(), {
        language: 'both',
      });
      setResults(searchResults);
    } catch (error) {

    } finally {
      setIsSearching(false);
    }
  }, [query, bookId]);

  const handleResultPress = (result: SearchResult) => {
    router.push({
      pathname: '/reader',
      params: { 
        bookId, 
        chapterId: result.chapterId,
        segmentId: result.segmentId,
        searchQuery: result.query,
      }
    });
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const renderHighlightedText = (text: string, matches: { index: number; length: number; text: string }[]) => {
    const parts = highlightMatches(text, matches);
    
    return (
      <Text style={styles.resultText} numberOfLines={2}>
        {parts.map((part, idx) => (
          <Text
            key={idx}
            style={part.isMatch ? [styles.highlight, { backgroundColor: theme.accentLight + '40' }] : null}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>Suchen</Text>
          {book && (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {book.title.de}
            </Text>
          )}
        </View>
        
        <View style={styles.placeholder} />
      </View>

      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
        <Ionicons name="search" size={20} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Text suchen..."
          placeholderTextColor={theme.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={performSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Button */}
      <TouchableOpacity
        style={[styles.searchButton, { backgroundColor: theme.accent }, !query.trim() && styles.searchButtonDisabled]}
        onPress={performSearch}
        disabled={!query.trim() || isSearching}
      >
        {isSearching ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="search" size={18} color="#fff" />
            <Text style={styles.searchButtonText}>Suchen</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Results */}
      <ScrollView
        style={styles.resultsContainer}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {hasSearched && !isSearching && results.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Keine Ergebnisse gefunden
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>
              Versuchen Sie es mit anderen Suchbegriffen
            </Text>
          </View>
        )}

        {results.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
              {results.length} {results.length === 1 ? 'Ergebnis' : 'Ergebnisse'} gefunden
            </Text>
          </View>
        )}

        {results.map((result, index) => (
          <TouchableOpacity
            key={`${result.segmentId}-${index}`}
            style={[styles.resultCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => handleResultPress(result)}
            activeOpacity={0.8}
          >
            <View style={styles.resultHeader}>
              <View style={[styles.chapterBadge, { backgroundColor: theme.accentLight + '30' }]}>
                <Text style={[styles.chapterBadgeText, { color: theme.accent }]}>
                  {result.chapterTitle.de}
                </Text>
              </View>
              <Text style={[styles.segmentInfo, { color: theme.textMuted }]}>
                Abschnitt {result.segmentIndex + 1}
              </Text>
            </View>

            <View style={styles.resultTexts}>
              {/* German Text */}
              {(result.matchedLanguage === 'german' || result.matchedLanguage === 'both') && (
                <View style={styles.textRow}>
                  <Text style={[styles.languageLabel, { color: theme.textMuted }]}>DE</Text>
                  {renderHighlightedText(result.germanText, result.matches.german)}
                </View>
              )}

              {/* Spanish Text */}
              {(result.matchedLanguage === 'spanish' || result.matchedLanguage === 'both') && (
                <View style={styles.textRow}>
                  <Text style={[styles.languageLabel, { color: theme.textMuted }]}>ES</Text>
                  {renderHighlightedText(result.spanishText, result.matches.spanish)}
                </View>
              )}
            </View>

            <View style={styles.resultArrow}>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </View>
          </TouchableOpacity>
        ))}
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
    paddingHorizontal: 16,
    paddingBottom: 16,
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
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 2,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    marginTop: 16,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chapterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chapterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  segmentInfo: {
    fontSize: 12,
  },
  resultTexts: {
    gap: 10,
  },
  textRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  languageLabel: {
    fontSize: 11,
    fontWeight: '700',
    width: 22,
    marginTop: 2,
  },
  resultText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  highlight: {
    fontWeight: '600',
    borderRadius: 2,
    overflow: 'hidden',
  },
  resultArrow: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
