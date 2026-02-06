import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReadingProgress } from '../types';

const PROGRESS_KEY = '@bivium_progress';

export function useProgress(chapterId: string) {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [chapterId]);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(PROGRESS_KEY);
      if (stored) {
        const allProgress: Record<string, ReadingProgress> = JSON.parse(stored);
        if (allProgress[chapterId]) {
          setProgress(allProgress[chapterId]);
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = useCallback(async (segmentIndex: number) => {
    try {
      const stored = await AsyncStorage.getItem(PROGRESS_KEY);
      const allProgress: Record<string, ReadingProgress> = stored ? JSON.parse(stored) : {};
      
      const newProgress: ReadingProgress = {
        chapterId,
        segmentIndex,
        lastReadAt: Date.now(),
      };
      
      allProgress[chapterId] = newProgress;
      setProgress(newProgress);
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [chapterId]);

  return {
    progress,
    isLoading,
    saveProgress,
  };
}
