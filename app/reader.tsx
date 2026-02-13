import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { BilingualReader } from '../src/components/BilingualReader';
import { PaginatedReader } from '../src/components/PaginatedReader';
import { loadChapter } from '../src/lib/bookLoader';
import { Chapter } from '../src/types';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../src/hooks/useTheme';
import { useSettings } from '../src/hooks/useSettings';

export default function ReaderScreen() {
  const { bookId, chapterId, segmentId, segmentIndex, searchQuery } = useLocalSearchParams<{ 
    bookId: string; 
    chapterId: string; 
    segmentId?: string;
    segmentIndex?: string;
    searchQuery?: string;
  }>();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const { settings, isLoading: settingsLoading } = useSettings();



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

        setError('Failed to load chapter');
        setLoading(false);
      });
  }, [bookId, chapterId]);

  if (loading || settingsLoading) {
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


  // Usar directamente settings.navigationMode - el EventEmitter se encarga de sincronizar
  if (settings.navigationMode === 'paginated') {

    return (
      <PaginatedReader
        chapter={chapter}
        onBack={() => {

          router.back();
        }}
        initialSegmentId={segmentId}
        initialSegmentIndex={segmentIndex ? parseInt(segmentIndex, 10) : undefined}
        searchQuery={searchQuery}
      />
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
