import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'marketing-app-progress';

interface ProgressData {
  completedLessons: number[];
  quizScores: Record<number, { correct: number; total: number }>;
}

const getStoredProgress = (): ProgressData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load progress:', e);
  }
  return { completedLessons: [], quizScores: {} };
};

const saveProgress = (data: ProgressData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
};

export function useProgress(totalLessons: number) {
  const [progress, setProgress] = useState<ProgressData>(getStoredProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const markLessonComplete = useCallback((lessonId: number, score?: { correct: number; total: number }) => {
    setProgress(prev => {
      const newCompleted = prev.completedLessons.includes(lessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId];

      const newScores = score
        ? { ...prev.quizScores, [lessonId]: score }
        : prev.quizScores;

      return {
        completedLessons: newCompleted,
        quizScores: newScores
      };
    });
  }, []);

  const isLessonComplete = useCallback((lessonId: number) => {
    return progress.completedLessons.includes(lessonId);
  }, [progress.completedLessons]);

  const getLessonScore = useCallback((lessonId: number) => {
    return progress.quizScores[lessonId];
  }, [progress.quizScores]);

  const getCompletionPercentage = useCallback(() => {
    return Math.round((progress.completedLessons.length / totalLessons) * 100);
  }, [progress.completedLessons.length, totalLessons]);

  const resetProgress = useCallback(() => {
    setProgress({ completedLessons: [], quizScores: {} });
  }, []);

  return {
    completedLessons: progress.completedLessons,
    completedCount: progress.completedLessons.length,
    totalLessons,
    markLessonComplete,
    isLessonComplete,
    getLessonScore,
    getCompletionPercentage,
    resetProgress
  };
}
