import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { BilingualReader } from '../src/components/BilingualReader';
import { loadChapter } from '../src/lib/bookLoader';
import { Chapter } from '../src/types';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../src/hooks/useTheme';

export default function ReaderScreen() {
  const { bookId, chapterId, segmentId, searchQuery } = useLocalSearchParams<{ 
    bookId: string; 
    chapterId: string; 
    segmentId?: string;
    searchQuery?: string;
  }>();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!bookId || !chapterId) {
      setError('Missing book or chapter ID');
      setLoading(false);
      return;
    }

    loadChapter(bookId, chapterId)
      .then((data) => {
        setChapter(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading chapter:', err);
        setError('Failed to load chapter');
        setLoading(false);
      });
  }, [bookId, chapterId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (error || !chapter) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <BilingualReader
      chapter={chapter}
      onBack={() => router.back()}
      initialSegmentId={segmentId}
      searchQuery={searchQuery}
    />
  );
}
