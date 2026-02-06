import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { BilingualReader } from '../src/components/BilingualReader';
import { loadChapter } from '../src/lib/bookLoader';
import { Chapter } from '../src/types';
import { router } from 'expo-router';
import { useTheme } from '../src/hooks/useTheme';

export default function ReaderScreen() {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    loadChapter('tod-in-venedig', 'chapter-1')
      .then((data) => {
        setChapter(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading chapter:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  if (!chapter) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        {/* Podríamos mostrar un error aquí */}
      </View>
    );
  }

  return (
    <BilingualReader
      chapter={chapter}
      onBack={() => router.back()}
    />
  );
}
